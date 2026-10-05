const { CITY_COORDS, STAGE_ORDER } = require('./locations');

// Haversine formula
function getDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

class AIEngine {
  constructor() {
    // In a real app, this would query a database. 
    // Here we store an in-memory history of scans per product.
    // Map of productId -> Array of scan objects: { location, timestamp, stage }
    this.scanHistory = {};
  }

  // Record a scan without scoring it (used when replaying a persisted chain)
  recordScan(productId, location, stage, timestampStr) {
    if (!this.scanHistory[productId]) {
      this.scanHistory[productId] = [];
    }
    this.scanHistory[productId].push({ location, stage, timestamp: timestampStr });
  }

  analyzeScan(productId, location, stage, timestampStr) {
    const timestamp = new Date(timestampStr);
    const history = this.scanHistory[productId] || [];
    
    let trustScore = 100;
    const anomalies = [];

    // 1. Geospatial Velocity
    // Flag if same product scanned 3000+ miles apart within 60 mins
    for (let pastScan of history) {
      const pastTime = new Date(pastScan.timestamp);
      const timeDiffMinutes = Math.abs((timestamp - pastTime) / (1000 * 60));
      
      if (timeDiffMinutes <= 60) {
        const coord1 = CITY_COORDS[location];
        const coord2 = CITY_COORDS[pastScan.location];
        
        if (coord1 && coord2) {
          const distance = getDistanceMiles(coord1.lat, coord1.lon, coord2.lat, coord2.lon);
          if (distance > 3000) {
            trustScore -= 50;
            anomalies.push(`Geospatial Velocity Anomaly: Scanned ${Math.round(distance)} miles apart within ${Math.round(timeDiffMinutes)} mins (${pastScan.location} -> ${location})`);
          }
        }
      }
    }

    // 2. Scan Frequency
    // Flag if same product scanned 20+ times in 1 hour
    const scansInLastHour = history.filter(scan => {
      const pastTime = new Date(scan.timestamp);
      return Math.abs((timestamp - pastTime) / (1000 * 60)) <= 60;
    });

    if (scansInLastHour.length >= 20) {
      trustScore -= 40;
      anomalies.push(`Scan Frequency Anomaly: Product scanned ${scansInLastHour.length} times in the last hour`);
    }

    // 3. Supply Chain Order Violation
    // Flag if retailer scan happens before warehouse scan, etc.
    // Find the max stage in the history
    let maxPastStage = 0;
    for (let pastScan of history) {
      const pastStageVal = STAGE_ORDER[pastScan.stage];
      if (pastStageVal > maxPastStage) {
        maxPastStage = pastStageVal;
      }
    }

    const currentStageVal = STAGE_ORDER[stage];
    // If the current stage is less than a past stage (e.g. Factory after Retailer)
    if (currentStageVal && maxPastStage && currentStageVal < maxPastStage) {
      trustScore -= 30;
      anomalies.push(`Supply Chain Order Anomaly: ${stage} scan occurred after a later stage scan`);
    }

    // Bound trust score
    if (trustScore < 0) trustScore = 0;

    this.recordScan(productId, location, stage, timestampStr);

    return {
      trustScore,
      isAuthentic: trustScore >= 70,
      anomalies
    };
  }
}

module.exports = { AIEngine };
