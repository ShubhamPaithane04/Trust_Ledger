const CITY_COORDS = {
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Dubai': { lat: 25.2048, lon: 55.2708 },
  'London': { lat: 51.5074, lon: -0.1278 },
  'New York': { lat: 40.7128, lon: -74.0060 },
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'Singapore': { lat: 1.3521, lon: 103.8198 },
  'Sydney': { lat: -33.8688, lon: 151.2093 },
  'San Francisco': { lat: 37.7749, lon: -122.4194 },
  'Toronto': { lat: 43.6510, lon: -79.3470 },
  'Berlin': { lat: 52.5200, lon: 13.4050 },
  'Geneva': { lat: 46.2044, lon: 6.1432 },
  'California': { lat: 36.7783, lon: -119.4179 },
  'Texas': { lat: 31.9686, lon: -99.9018 }
};

const STAGE_ORDER = {
  'Factory': 1,
  'Warehouse': 2,
  'Distributor': 3,
  'Retailer': 4,
  'Consumer': 5
};

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

  // Pre-load seed data
  seedData(history) {
    this.scanHistory = history;
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

    // Record this scan
    if (!this.scanHistory[productId]) {
      this.scanHistory[productId] = [];
    }
    this.scanHistory[productId].push({ location, stage, timestamp: timestampStr });

    return {
      trustScore,
      isAuthentic: trustScore >= 70,
      anomalies
    };
  }
}

module.exports = { AIEngine };
