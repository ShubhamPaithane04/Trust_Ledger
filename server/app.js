const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Block, Blockchain } = require('./Blockchain');
const { AIEngine } = require('./AIEngine');
const { CITY_COORDS, STAGE_ORDER } = require('./locations');

const KNOWN_LOCATIONS = new Set(Object.keys(CITY_COORDS));
const KNOWN_STAGES = new Set(Object.keys(STAGE_ORDER));
const MAX_IMAGE_LENGTH = 4 * 1024 * 1024; // ~3MB image once base64 encoded

const DEFAULT_PRODUCTS = {
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

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

class Ledger {
  constructor(dataFile) {
    this.dataFile = dataFile;
    if (dataFile && fs.existsSync(dataFile)) {
      this.load();
    } else {
      this.seed();
    }
  }

  reset() {
    this.chain = new Blockchain();
    this.aiEngine = new AIEngine();
    this.products = {};
    this.alerts = [];
    this.tamperBackup = null;
  }

  mintProduct(productId, name, location, stage, timestamp, image) {
    this.products[productId] = image ? { name, image } : { name };
    const blockData = { productId, location, stage, type: 'MINT' };
    if (image) blockData.image = image;
    const block = new Block(this.chain.chain.length, timestamp, blockData);
    this.chain.addBlock(block);
    this.aiEngine.recordScan(productId, location, stage, timestamp);
    return block;
  }

  scanProduct(productId, location, stage, timestamp) {
    const aiResult = this.aiEngine.analyzeScan(productId, location, stage, timestamp);
    const blockData = { productId, location, stage, type: 'SCAN', aiResult };
    const block = new Block(this.chain.chain.length, timestamp, blockData);
    this.chain.addBlock(block);

    if (aiResult.anomalies.length > 0) {
      this.alerts.unshift({
        id: Date.now() + Math.random(),
        timestamp,
        productId,
        location,
        anomalies: aiResult.anomalies,
        trustScore: aiResult.trustScore
      });
    }
    return { aiResult, block };
  }

  seed() {
    this.reset();
    const now = Date.now();
    const ago = (minutes) => new Date(now - minutes * 60 * 1000).toISOString();
    const DAY = 24 * 60;

    const factories = {
      'PRD-101': 'Tokyo', 'PRD-102': 'London', 'PRD-103': 'Mumbai',
      'PRD-104': 'Dubai', 'PRD-105': 'Tokyo', 'PRD-106': 'Berlin',
      'PRD-107': 'Geneva', 'PRD-108': 'Tokyo', 'PRD-109': 'California'
    };
    for (const [productId, location] of Object.entries(factories)) {
      this.mintProduct(productId, DEFAULT_PRODUCTS[productId].name, location, 'Factory', ago(2 * DAY));
    }

    // Normal journeys, spaced out so honest shipments never look like impossible travel
    this.scanProduct('PRD-101', 'London', 'Distributor', ago(DAY));
    this.scanProduct('PRD-101', 'New York', 'Retailer', ago(60));
    this.scanProduct('PRD-102', 'New York', 'Warehouse', ago(DAY));
    this.scanProduct('PRD-103', 'Dubai', 'Warehouse', ago(DAY));
    this.scanProduct('PRD-105', 'Mumbai', 'Warehouse', ago(DAY));
    this.scanProduct('PRD-104', 'London', 'Warehouse', ago(DAY));
    this.scanProduct('PRD-104', 'New York', 'Distributor', ago(60));
    this.scanProduct('PRD-106', 'London', 'Warehouse', ago(DAY));
    this.scanProduct('PRD-107', 'Paris', 'Distributor', ago(60));
    this.scanProduct('PRD-108', 'New York', 'Distributor', ago(60));
    this.scanProduct('PRD-109', 'Texas', 'Warehouse', ago(DAY));

    // Pre-flagged anomaly 1: impossible travel from New York to Tokyo
    this.scanProduct('PRD-101', 'Tokyo', 'Consumer', ago(10));
    // Pre-flagged anomaly 2: Factory scan after a Distributor scan
    this.scanProduct('PRD-104', 'Mumbai', 'Factory', ago(5));

    this.save();
  }

  load() {
    const raw = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
    this.chain = Blockchain.fromJSON(raw.chain);
    this.products = raw.products || {};
    this.alerts = raw.alerts || [];
    this.tamperBackup = raw.tamperBackup || null;

    // Rebuild the AI engine's scan history by replaying the chain
    this.aiEngine = new AIEngine();
    for (const block of this.chain.chain) {
      const { productId, location, stage } = block.data || {};
      if (productId && location && stage) {
        this.aiEngine.recordScan(productId, location, stage, block.timestamp);
      }
    }
  }

  save() {
    if (!this.dataFile) return;
    fs.mkdirSync(path.dirname(this.dataFile), { recursive: true });
    const tmp = `${this.dataFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({
      chain: this.chain.chain,
      products: this.products,
      alerts: this.alerts,
      tamperBackup: this.tamperBackup
    }));
    fs.renameSync(tmp, this.dataFile);
  }
}

function validateLocationAndStage(res, location, stage) {
  if (!KNOWN_LOCATIONS.has(location)) {
    badRequest(res, `Unknown location: ${location}`);
    return false;
  }
  if (!KNOWN_STAGES.has(stage)) {
    badRequest(res, `Unknown supply-chain stage: ${stage}`);
    return false;
  }
  return true;
}

function createApp({ dataFile = null } = {}) {
  const ledger = new Ledger(dataFile);
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/locations', (req, res) => {
    res.json({
      locations: Object.entries(CITY_COORDS).map(([name, coords]) => ({ name, ...coords })),
      stages: Object.keys(STAGE_ORDER)
    });
  });

  app.post('/api/mint', (req, res) => {
    const productId = normalizeText(req.body.productId).toUpperCase();
    const name = normalizeText(req.body.name);
    const location = normalizeText(req.body.location);
    const stage = normalizeText(req.body.stage);
    const image = normalizeText(req.body.image);

    if (!productId || !name || !location || !stage) {
      return badRequest(res, 'Missing required fields');
    }
    if (!/^[A-Z0-9-]{3,32}$/.test(productId)) {
      return badRequest(res, 'Product ID must be 3-32 letters, digits or dashes');
    }
    if (!validateLocationAndStage(res, location, stage)) return;
    if (image && (!image.startsWith('data:image/') || image.length > MAX_IMAGE_LENGTH)) {
      return badRequest(res, 'Image must be a data:image URL under 3MB');
    }
    if (ledger.products[productId]) {
      return res.status(409).json({ error: `Product ${productId} is already registered` });
    }

    const block = ledger.mintProduct(productId, name, location, stage, new Date().toISOString(), image);
    ledger.save();
    res.status(201).json({
      success: true,
      message: 'Product minted successfully',
      productId,
      block: { index: block.index, hash: block.hash }
    });
  });

  app.post('/api/scan', (req, res) => {
    const productId = normalizeText(req.body.productId).toUpperCase();
    const location = normalizeText(req.body.location);
    const stage = normalizeText(req.body.stage);

    if (!productId || !location || !stage) {
      return badRequest(res, 'Missing required fields');
    }
    if (!validateLocationAndStage(res, location, stage)) return;
    if (!ledger.products[productId]) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { aiResult, block } = ledger.scanProduct(productId, location, stage, new Date().toISOString());
    ledger.save();
    res.json({ success: true, result: aiResult, block: { index: block.index, hash: block.hash } });
  });

  app.get('/api/chain', (req, res) => {
    const invalidBlock = ledger.chain.findInvalidBlock();
    res.json({
      chain: ledger.chain.chain,
      isValid: invalidBlock === -1,
      invalidBlock
    });
  });

  app.get('/api/products', (req, res) => {
    res.json(ledger.products);
  });

  app.get('/api/products/:id/history', (req, res) => {
    const productId = normalizeText(req.params.id).toUpperCase();
    const product = ledger.products[productId];
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const events = ledger.chain.chain
      .filter((block) => block.data && block.data.productId === productId)
      .map((block) => ({
        index: block.index,
        hash: block.hash,
        timestamp: block.timestamp,
        type: block.data.type,
        location: block.data.location,
        stage: block.data.stage,
        aiResult: block.data.aiResult || null
      }));
    res.json({ productId, ...product, events });
  });

  app.get('/api/alerts', (req, res) => {
    res.json(ledger.alerts);
  });

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      products: Object.keys(ledger.products).length,
      blocks: ledger.chain.chain.length,
      alerts: ledger.alerts.length,
      isValid: ledger.chain.verifyChain()
    });
  });

  // Security demo: overwrite block 1's data without re-hashing, which breaks verification
  app.post('/api/tamper', (req, res) => {
    if (ledger.chain.chain.length < 2) {
      return res.status(400).json({ error: 'Not enough blocks to tamper' });
    }
    if (!ledger.tamperBackup) {
      ledger.tamperBackup = { index: 1, data: ledger.chain.chain[1].data };
    }
    ledger.chain.chain[1].data = { tampered: true, message: 'Hacked!' };
    ledger.save();
    res.json({ success: true, message: 'Chain tampered!' });
  });

  // Undo the tamper demo by restoring the original block data from the trusted backup
  app.post('/api/restore', (req, res) => {
    if (!ledger.tamperBackup) {
      return res.status(400).json({ error: 'Nothing to restore' });
    }
    const { index, data } = ledger.tamperBackup;
    ledger.chain.chain[index].data = data;
    ledger.tamperBackup = null;
    ledger.save();
    res.json({ success: true, isValid: ledger.chain.verifyChain() });
  });

  // Wipe everything and reload the demo seed data
  app.post('/api/reset', (req, res) => {
    ledger.seed();
    res.json({ success: true, blocks: ledger.chain.chain.length });
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Return JSON for malformed bodies and oversized payloads instead of Express's HTML page
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status === 413 ? 'Payload too large' : err.message || 'Server error' });
  });

  return { app, ledger };
}

module.exports = { createApp };
