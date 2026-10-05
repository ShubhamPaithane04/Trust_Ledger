const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Block, Blockchain } = require('../Blockchain');
const { AIEngine } = require('../AIEngine');
const { createApp } = require('../app');

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

describe('Blockchain', () => {
  test('links blocks and detects tampering', () => {
    const chain = new Blockchain();
    chain.addBlock(new Block(1, minutesAgo(2), { productId: 'A' }));
    chain.addBlock(new Block(2, minutesAgo(1), { productId: 'B' }));
    assert.equal(chain.verifyChain(), true);
    assert.equal(chain.chain[2].previousHash, chain.chain[1].hash);

    chain.chain[1].data = { tampered: true };
    assert.equal(chain.verifyChain(), false);
    assert.equal(chain.findInvalidBlock(), 1);
  });

  test('fromJSON keeps stored hashes', () => {
    const chain = new Blockchain();
    chain.addBlock(new Block(1, minutesAgo(1), { productId: 'A' }));
    const raw = JSON.parse(JSON.stringify(chain.chain));
    raw[1].data.productId = 'B';
    assert.equal(Blockchain.fromJSON(raw).verifyChain(), false);
  });
});

describe('AIEngine', () => {
  test('clean journey keeps full trust', () => {
    const ai = new AIEngine();
    ai.recordScan('P', 'Tokyo', 'Factory', minutesAgo(300));
    const result = ai.analyzeScan('P', 'Tokyo', 'Warehouse', minutesAgo(200));
    assert.equal(result.trustScore, 100);
    assert.equal(result.isAuthentic, true);
  });

  test('flags impossible travel', () => {
    const ai = new AIEngine();
    ai.recordScan('P', 'New York', 'Retailer', minutesAgo(20));
    const result = ai.analyzeScan('P', 'Tokyo', 'Consumer', minutesAgo(10));
    assert.equal(result.isAuthentic, false);
    assert.match(result.anomalies[0], /Geospatial Velocity/);
  });

  test('flags supply-chain order violations', () => {
    const ai = new AIEngine();
    ai.recordScan('P', 'London', 'Retailer', minutesAgo(300));
    const result = ai.analyzeScan('P', 'London', 'Factory', minutesAgo(10));
    assert.equal(result.trustScore, 70);
    assert.match(result.anomalies[0], /Supply Chain Order/);
  });

  test('flags scan frequency', () => {
    const ai = new AIEngine();
    for (let i = 0; i < 20; i++) ai.recordScan('P', 'London', 'Retailer', minutesAgo(30));
    const result = ai.analyzeScan('P', 'London', 'Retailer', minutesAgo(1));
    assert.ok(result.anomalies.some((a) => /Scan Frequency/.test(a)));
  });
});

describe('API', () => {
  let server;
  let base;
  let dataFile;

  const call = async (method, url, body) => {
    const res = await fetch(base + url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: res.status, body: await res.json() };
  };

  before(async () => {
    dataFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-')), 'ledger.json');
    const { app } = createApp({ dataFile });
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => {
    server.closeAllConnections();
    server.close();
    fs.rmSync(path.dirname(dataFile), { recursive: true, force: true });
  });

  test('seeds demo data with two anomalies', async () => {
    const { body } = await call('GET', '/api/health');
    assert.equal(body.products, 9);
    assert.equal(body.alerts, 2);
    assert.equal(body.isValid, true);
  });

  test('mints, rejects duplicates and validates input', async () => {
    const product = { productId: 'prd-900', name: 'Test Watch', location: 'Geneva', stage: 'Factory' };
    const created = await call('POST', '/api/mint', product);
    assert.equal(created.status, 201);
    assert.equal(created.body.productId, 'PRD-900');
    assert.equal(created.body.block.hash.length, 64);

    assert.equal((await call('POST', '/api/mint', product)).status, 409);
    assert.equal((await call('POST', '/api/mint', { ...product, productId: 'X', location: 'Mars' })).status, 400);
    assert.equal((await call('POST', '/api/mint', { ...product, productId: 'PRD-901', image: 'javascript:1' })).status, 400);
  });

  test('scans return the block and build product history', async () => {
    const scan = await call('POST', '/api/scan', { productId: 'PRD-900', location: 'Paris', stage: 'Warehouse' });
    assert.equal(scan.status, 200);
    assert.equal(scan.body.result.isAuthentic, true);

    const history = await call('GET', '/api/products/prd-900/history');
    assert.equal(history.body.name, 'Test Watch');
    assert.deepEqual(history.body.events.map((e) => e.stage), ['Factory', 'Warehouse']);
    assert.equal(history.body.events[1].hash, scan.body.block.hash);

    assert.equal((await call('POST', '/api/scan', { productId: 'NOPE', location: 'Paris', stage: 'Retailer' })).status, 404);
  });

  test('tamper breaks the chain and restore repairs it', async () => {
    await call('POST', '/api/tamper');
    let chain = await call('GET', '/api/chain');
    assert.equal(chain.body.isValid, false);
    assert.equal(chain.body.invalidBlock, 1);

    await call('POST', '/api/restore');
    chain = await call('GET', '/api/chain');
    assert.equal(chain.body.isValid, true);
  });

  test('persists the ledger to disk and reloads it', async () => {
    const reloaded = createApp({ dataFile }).ledger;
    assert.ok(reloaded.products['PRD-900']);
    assert.equal(reloaded.chain.verifyChain(), true);
    // Replayed history still catches impossible travel after a restart
    reloaded.scanProduct('PRD-900', 'Paris', 'Retailer', new Date().toISOString());
    const { aiResult } = reloaded.scanProduct('PRD-900', 'Sydney', 'Consumer', new Date().toISOString());
    assert.equal(aiResult.isAuthentic, false);
  });

  test('returns JSON errors for bad bodies and unknown routes', async () => {
    const res = await fetch(base + '/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
    assert.equal(res.status, 400);
    assert.ok((await res.json()).error);
    assert.equal((await call('GET', '/api/nope')).status, 404);
  });
});
