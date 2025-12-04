**Overview**

This folder contains the Node/Express development server and the client pages for the Sun Devil Sync replica. The server serves static files from the `asu_replica` directory and provides API endpoints under `/api` backed by a local SQLite database.

**Quick Start (macOS / zsh)**

- **Install dependencies:**

  ```bash
  cd /Users/roystonf/Sun-Devil-Sync-Clone/asu_replica
  npm install
  ```

- **Start the server:**

  ```bash
  npm start
  # or explicitly:
  node server.js
  ```

- **Open in browser:**

  - Default URL: `http://localhost:3000`
  - If you set a different port: `http://localhost:<PORT>`

**Notes**

- The server will create a `database.sqlite` file in the `asu_replica` folder on first run and seed `groups` and `events` from `data/*.json`.
- Minted badges are also indexed off-chain in the `minted_badges` table for quick UI lists (on-chain source of truth is the SunDevilBadge contract).
- Default test users:
  - Student — **username**: `student`  **password**: `password123`  (email `student@asu.edu`)
  - Admin — **username**: `admin`  **password**: `adminpass123`  (email `admin@asu.edu`)
- API endpoints are mounted at `/api` (see `routes/auth.js` and `routes/api.js`).
- To change the port, set the `PORT` environment variable before start, e.g. `PORT=4000 npm start`.

**Optional: Static-only preview**

If you only want to preview the static site without the server, from any folder that contains `index.html` you can run a simple static server:

```bash
# using Python 3
python3 -m http.server 8000
# or using npm
npx serve .
```

**Optional: Smart contracts (Hardhat)**

Contracts live in `blockchain/`. To compile or deploy locally:

```bash
cd /Users/roystonf/Sun-Devil-Sync-Clone/asu_replica/blockchain
npm install
npx hardhat compile
npx hardhat node         # start a local node
  npx hardhat run scripts/deploy.js --network localhost
```
- Hardhat works best on Node 18.17+; if you see cache permission errors, set `HOME`/`XDG_CACHE_HOME` to the project folder when running commands.
- For Polygon Amoy deploys, set `AMOY_RPC_URL` and `PRIVATE_KEY` (with `0x` prefix) in `blockchain/.env`.

**SunDevilCoin (SDC)**

- ERC-20 contract lives in `blockchain/contracts/SunDevilCoin.sol`.
- Deploy helper: `npx hardhat run scripts/deploy-coin.js --network polygonAmoy` (or `--network localhost`). Configure optionally via `COIN_INITIAL_SUPPLY` (tokens, not wei) and `COIN_INITIAL_OWNER` in `.env`.
- Backend expects `COIN_CONTRACT_ADDRESS` alongside `AMOY_RPC_URL` and `PRIVATE_KEY`. It respects `MOCK_CHAIN=true` the same way badges do.
- New API routes (mounted at `/api`):
  - `GET /api/coin/status` — config + mock flag
  - `GET /api/coin/balance/:address` — wallet balance (18 decimals)
  - `GET /api/coin/total-supply` — total minted supply
  - `POST /api/coin/mint` — admin-only; body `{ "recipient": "0x...", "amount": "50" }` (amount in whole tokens, converted to 18 decimals)
  - `POST /api/coin/transfer` — admin-only; moves tokens from issuer wallet to a recipient
  - `GET /api/coin/transactions` — admin-only off-chain log of mint/transfer calls
- Quick mint test (mock is fine):

  ```bash
  curl -X POST http://localhost:3000/api/coin/mint \
    -H "Content-Type: application/json" \
    --cookie-jar cookie.txt \
    -d '{"recipient":"0x0000000000000000000000000000000000000001","amount":"50"}'
  ```

**Blockchain badge integration (Polygon Amoy)**

- Copy `.env.example` to `.env` and fill in:
  - `MOCK_CHAIN=true` to use the in-memory mock (no blockchain needed)
  - For real testnet calls: `AMOY_RPC_URL`, `BADGE_CONTRACT_ADDRESS`, `PRIVATE_KEY`
  - PRIVATE_KEY must include the `0x` prefix and be exactly 64 hex chars (no quotes)
- New API routes (mounted at `/api`):
  - `GET /api/badges/status` — shows if blockchain is configured or using mock
  - `GET /api/badges` — list recently minted badges from the off-chain index
  - `POST /api/badges/mint` — admin-only; body must include `studentWallet`, `eventId`, `eventName`, `eventDate`, `achievementType`, `metadataURI`
  - `GET /api/badges/:tokenId` — fetch badge details and token URI for verification pages
- Quick mint test (mock mode is fine):

  ```bash
  # login as admin first (use admin/adminpass123)
  curl -X POST http://localhost:3000/api/badges/mint \
    -H "Content-Type: application/json" \
    --cookie-jar cookie.txt \
    -d '{"studentWallet":"0x0000000000000000000000000000000000000001","eventId":1,"eventName":"Demo","eventDate":"2025-01-01","achievementType":"attended","metadataURI":"ipfs://demo"}'
  ```

**New UI pages**

- `verify.html` — employer/faculty verifier for badges (token ID lookup). Accepts `?tokenId=123` in the URL.
- `admin.html` — admin badge mint form (requires admin login; calls `/api/badges/mint`).
- `badges.html` — public feed of minted badges (off-chain index) with links to verify on-chain.
- Navigation links to these pages were added to the top nav across main pages.

**Usage summary**

1) Install & run:
   - `cd /Users/roystonf/Sun-Devil-Sync-Clone/asu_replica`
   - `npm install`
   - `cp .env.example .env` (leave `MOCK_CHAIN=true` for local testing)
   - `npm start`
2) Mint (mock or on-chain):
   - Open `admin.html`, log in as admin, fill in badge form, submit. Result shows token ID and tx hash (mock hash if in mock mode).
3) Verify:
   - Open `verify.html` and enter the token ID, or use `verify.html?tokenId=<id>`.
4) Browse badges:
   - Open `badges.html` to see the off-chain list of minted badges with quick links to verify.
5) Switch to real Amoy:
   - In `.env`, set `MOCK_CHAIN=false`, provide `AMOY_RPC_URL`, `BADGE_CONTRACT_ADDRESS`, and `PRIVATE_KEY` for the issuer wallet (must have MINTER_ROLE).

**Troubleshooting**

- If `npm install` fails, ensure you have a recent Node.js installed (use `nvm` to manage versions). If `node: command not found` install Node LTS.
- If port `3000` is in use, either stop the conflicting service or start with another port: `PORT=4000 npm start`.
- Ensure the `asu_replica` folder is writable so `database.sqlite` can be created.

---

Open `http://localhost:3000` after starting the server.
