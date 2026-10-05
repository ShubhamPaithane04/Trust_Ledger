// Single source of truth for supported scan locations and supply-chain stages.
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

module.exports = { CITY_COORDS, STAGE_ORDER };
