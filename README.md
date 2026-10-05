# Trust Ledger (ChainVerify)

Counterfeit detection for supply chains. Every product registration and scan is written to a SHA-256 hash-linked ledger, and an AI rules engine scores each scan for signs of fraud.

## How it works

1. **Mint**: a manufacturer registers a product at its factory. That creates a `MINT` block.
2. **Scan**: each hand-off (warehouse, distributor, retailer, consumer) adds a `SCAN` block.
3. **Score**: before each scan is written, the AI engine checks it against the product's history and returns a trust score from 0 to 100. A product scoring under 70 is flagged as a likely counterfeit.
4. **Verify**: every block stores the hash of the block before it, so editing any past block breaks the chain, and the explorer shows exactly where it broke.

### Anomaly rules (`server/AIEngine.js`)

| Rule | Trigger | Penalty |
|---|---|---|
| Geospatial velocity | Scanned more than 3000 miles apart within 60 minutes | -50 |
| Scan frequency | 20 or more scans of the same product in one hour | -40 |
| Supply-chain order | An earlier stage after a later one (for example, Factory after Retailer) | -30 |

## Project layout

```
server/         Express API (port 3001)
  app.js        routes and ledger state
  Blockchain.js block hashing and chain verification
  AIEngine.js   anomaly scoring
  locations.js  supported cities and stages
  test/         node:test suite
  data/         ledger.json, created at runtime (git-ignored)
client/         React + TanStack Start frontend (port 5173, proxies /api to 3001)
client_old/     earlier Vite prototype, kept for reference
```

## Running it

You need Node.js 20 or later.

```bash
npm run install:all   # install server and client dependencies

npm run server        # terminal 1: API on http://localhost:3001
npm run client        # terminal 2: app on http://127.0.0.1:5173

npm test              # server test suite
```

On first start the server seeds 9 demo products and two flagged anomalies, then saves everything to `server/data/ledger.json`. Delete that file, or call `POST /api/reset`, to start over. Set `LEDGER_FILE` to store it somewhere else and `PORT` to change the port.

## Pages

| Route | What it does |
|---|---|
| `/` | Landing page |
| `/dashboard` | Manufacturer console: mint products, watch the live ledger, run the tamper demo |
| `/explorer` | Search and inspect blocks; highlights the block where verification fails |
| `/map` | Product routes between cities; flagged legs are drawn in red |
| `/ai-center` | Feed of AI anomaly alerts |
| `/scanner` | Consumer check: scan a product, get a verdict, trust score and full provenance trail |

## API

| Method | Path | Body / notes |
|---|---|---|
| GET | `/api/health` | Counts and chain validity |
| GET | `/api/locations` | Supported cities (with coordinates) and stages |
| GET | `/api/products` | All registered products |
| GET | `/api/products/:id/history` | Every block for one product, oldest first |
| POST | `/api/mint` | `{ productId, name, location, stage, image? }`; returns 409 if the ID exists |
| POST | `/api/scan` | `{ productId, location, stage }`; returns the AI result and the new block's hash |
| GET | `/api/chain` | `{ chain, isValid, invalidBlock }` |
| GET | `/api/alerts` | Flagged scans, newest first |
| POST | `/api/tamper` | Demo: overwrites block 1 without re-hashing it |
| POST | `/api/restore` | Undoes the tamper demo from the saved backup |
| POST | `/api/reset` | Wipes the ledger and re-seeds the demo data |

The tamper, restore and reset endpoints exist for demos and have no authentication. Remove them or put them behind auth before deploying anywhere public.
