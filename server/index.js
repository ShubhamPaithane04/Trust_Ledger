const express = require('express');
const cors = require('cors');
const { Block, Blockchain } = require('./Blockchain');
const { AIEngine } = require('./AIEngine');

const app = express();
app.use(cors());
app.use(express.json());

const chainVerify = new Blockchain();
const aiEngine = new AIEngine();
const alerts = []; // Store live alerts

const KNOWN_LOCATIONS = new Set([
  'Tokyo',
  'London',
  'New York',
  'Mumbai',
  'Dubai',
  'Paris',
  'Singapore',
  'Sydney',
  'San Francisco',
  'Toronto',
  'Berlin',
  'Geneva',
  'California',
  'Texas',
]);

const KNOWN_STAGES = new Set(['Factory', 'Warehouse', 'Distributor', 'Retailer', 'Consumer']);

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

// Pre-registered products
const products = {
  'PRD-101': { name: 'Nike Shoes' },
  'PRD-102': { name: 'Pfizer Medicine' },
  'PRD-103': { name: 'iPhone' },
  'PRD-104': { name: 'Rolex Watch' },
  'PRD-105': { name: 'Samsung Chip' },
  'PRD-106': { name: 'Aspirin (Medicine)' },
  'PRD-107': { name: 'Insulin Pen (Medicine)' },
  'PRD-108': { name: 'Sony PlayStation 5 (Electronic)' },
  'PRD-109': { name: 'MacBook Pro (Electronic)' }
};

// Function to safely mint and add to blockchain
function mintProduct(productId, location, stage, timestamp, image) {
  const blockData = { productId, location, stage, type: 'MINT' };
  if (image) blockData.image = image;
  chainVerify.addBlock(new Block(chainVerify.chain.length, timestamp, blockData));
  aiEngine.analyzeScan(productId, location, stage, timestamp);
}

function scanProduct(productId, location, stage, timestamp) {
  const aiResult = aiEngine.analyzeScan(productId, location, stage, timestamp);
  const blockData = { productId, location, stage, type: 'SCAN', aiResult };
  chainVerify.addBlock(new Block(chainVerify.chain.length, timestamp, blockData));
  
  if (aiResult.anomalies.length > 0) {
    alerts.unshift({
      id: Date.now() + Math.random(),
      timestamp,
      productId,
      location,
      anomalies: aiResult.anomalies,
      trustScore: aiResult.trustScore
    });
  }
  return aiResult;
}

// SEED DATA
const now = new Date();
const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();

// Mint 5 products
mintProduct('PRD-101', 'Tokyo', 'Factory', threeHoursAgo);
mintProduct('PRD-102', 'London', 'Factory', threeHoursAgo);
mintProduct('PRD-103', 'Mumbai', 'Factory', threeHoursAgo);
mintProduct('PRD-104', 'Dubai', 'Factory', threeHoursAgo);
mintProduct('PRD-105', 'Tokyo', 'Factory', threeHoursAgo);
mintProduct('PRD-106', 'Berlin', 'Factory', threeHoursAgo);
mintProduct('PRD-107', 'Geneva', 'Factory', threeHoursAgo);
mintProduct('PRD-108', 'Tokyo', 'Factory', threeHoursAgo);
mintProduct('PRD-109', 'California', 'Factory', threeHoursAgo);

// 10 pre-existing scans
scanProduct('PRD-101', 'London', 'Distributor', twoHoursAgo);
scanProduct('PRD-101', 'New York', 'Retailer', hourAgo);
scanProduct('PRD-102', 'New York', 'Warehouse', twoHoursAgo);
scanProduct('PRD-103', 'Dubai', 'Warehouse', twoHoursAgo);
scanProduct('PRD-105', 'Mumbai', 'Warehouse', twoHoursAgo);
// ... adding a few more standard scans
scanProduct('PRD-104', 'London', 'Warehouse', twoHoursAgo);
scanProduct('PRD-104', 'New York', 'Distributor', hourAgo);
scanProduct('PRD-106', 'London', 'Warehouse', twoHoursAgo);
scanProduct('PRD-107', 'Paris', 'Distributor', hourAgo);
scanProduct('PRD-108', 'New York', 'Distributor', hourAgo);
scanProduct('PRD-109', 'Texas', 'Warehouse', twoHoursAgo);

// 2 pre-flagged anomalies
// Anomaly 1: Geospatial (impossible travel from NY to Tokyo in 10 mins for PRD-101)
const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
scanProduct('PRD-101', 'Tokyo', 'Consumer', tenMinsAgo); 

// Anomaly 2: Supply chain order violation (Factory scan after Retailer for PRD-104)
const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
scanProduct('PRD-104', 'Mumbai', 'Factory', fiveMinsAgo);


// API ENDPOINTS
app.post('/api/mint', (req, res) => {
  const productId = normalizeText(req.body.productId).toUpperCase();
  const name = normalizeText(req.body.name);
  const location = normalizeText(req.body.location);
  const stage = normalizeText(req.body.stage);
  const image = normalizeText(req.body.image);

  if (!productId || !name || !location || !stage) {
    return badRequest(res, 'Missing required fields');
  }
  if (!KNOWN_LOCATIONS.has(location)) {
    return badRequest(res, `Unknown location: ${location}`);
  }
  if (!KNOWN_STAGES.has(stage)) {
    return badRequest(res, `Unknown supply-chain stage: ${stage}`);
  }
  products[productId] = { name, image };
  mintProduct(productId, location, stage, new Date().toISOString(), image);
  res.status(201).json({ success: true, message: 'Product minted successfully', productId });
});

app.post('/api/scan', (req, res) => {
  const productId = normalizeText(req.body.productId).toUpperCase();
  const location = normalizeText(req.body.location);
  const stage = normalizeText(req.body.stage);

  if (!productId || !location || !stage) {
    return badRequest(res, 'Missing required fields');
  }
  if (!KNOWN_LOCATIONS.has(location)) {
    return badRequest(res, `Unknown location: ${location}`);
  }
  if (!KNOWN_STAGES.has(stage)) {
    return badRequest(res, `Unknown supply-chain stage: ${stage}`);
  }
  if (!products[productId]) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const result = scanProduct(productId, location, stage, new Date().toISOString());
  res.json({ success: true, result });
});

app.get('/api/chain', (req, res) => {
  res.json({ 
    chain: chainVerify.chain, 
    isValid: chainVerify.verifyChain() 
  });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    products: Object.keys(products).length,
    blocks: chainVerify.chain.length,
    alerts: alerts.length,
    isValid: chainVerify.verifyChain(),
  });
});

app.post('/api/tamper', (req, res) => {
  // Tamper with block 1 data to demonstrate chain breaking
  if (chainVerify.chain.length > 1) {
    chainVerify.chain[1].data = { tampered: true, message: 'Hacked!' };
    res.json({ success: true, message: 'Chain tampered!' });
  } else {
    res.status(400).json({ error: 'Not enough blocks to tamper' });
  }
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
