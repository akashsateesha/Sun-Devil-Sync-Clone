**Overview**

This folder contains the Node/Express development server and the client pages for the Sun Devil Sync replica. The server serves static files from the `asu_replica` directory and provides API endpoints under `/api` backed by a local SQLite database.

**Quick Start (macOS / zsh)**

- **Node version:** `.nvmrc` targets Node 20. If you use `nvm`, run `nvm use`.
- **Install dependencies:**

  ```bash
  cd /Users/roystonf/Sun-Devil-Sync-Clone/asu_replica
  npm install
  ```

- **Env file:** `cp .env.example .env` then set a strong `SESSION_SECRET`. Leave `MOCK_CHAIN=true` for mock mode.

- **Start the server (nodemon):**

  ```bash
  npm run dev   # restarts on file changes
  # or:
  npm start
  # or explicitly:
  node server.js
  ```

- **Open in browser:**

  - Default URL: `http://localhost:3000`
  - If you set a different port: `http://localhost:<PORT>`

**Tooling**

- Lint: `npm run lint` (auto-fix with `npm run lint:fix`)
- Format: `npm run format` (check only: `npm run format:check`)

**Environment and modes**

- `.env` values (see `.env.example`):
  - `SESSION_SECRET` (required for stable sessions)
  - `PORT` (optional, defaults to 3000)
  - `MOCK_CHAIN=true` for fully local/mock badge flows (no blockchain needed)
  - For live chain calls set `MOCK_CHAIN=false` and provide `AMOY_RPC_URL`, `BADGE_CONTRACT_ADDRESS`, `PRIVATE_KEY`
- SQLite database file `database.sqlite` is created on first run and seeded from `data/*.json`.
- Test users:
  - Student — **username**: `student`  **password**: `password123`  (email `student@asu.edu`)
  - Admin — **username**: `admin`  **password**: `adminpass123`  (email `admin@asu.edu`)

**Blockchain deployment options**

- **Mock (recommended for UI/dev):** keep `MOCK_CHAIN=true`. Badge mint/verify uses the in-memory mock; no wallet needed.
- **Local Hardhat network (for on-chain testing you control):**
  ```bash
  cd /Users/roystonf/Sun-Devil-Sync-Clone/asu_replica/blockchain
  npm install
  npx hardhat node                                   # start local chain (chainId 31337)
  npx hardhat run scripts/deploy.js --network localhost
  ```
  - Copy the deployed contract address into `BADGE_CONTRACT_ADDRESS` in your root `.env`.
  - Set `MOCK_CHAIN=false`, `AMOY_RPC_URL=http://127.0.0.1:8545`, and `PRIVATE_KEY` to one of the Hardhat accounts printed in the node output (import that account into MetaMask for testing).
- **Polygon Amoy testnet:**
  ```bash
  cd /Users/roystonf/Sun-Devil-Sync-Clone/asu_replica/blockchain
  npm install
  npx hardhat run scripts/deploy.js --network polygonAmoy
  ```
  - Provide `AMOY_RPC_URL` and `PRIVATE_KEY` for a funded testnet wallet (with MATIC).
  - Copy the deployed address into `BADGE_CONTRACT_ADDRESS` in `.env` and set `MOCK_CHAIN=false`.
  - Import the same wallet into MetaMask; select the Polygon Amoy network (chainId 80002).

**Sun Devil Coin (SDC)**

- Contract: `blockchain/contracts/SDCToken.sol` (simple ERC20; mints 1,000,000 SDC to deployer).
- Deploy to Amoy:
  ```bash
  cd /Users/roystonf/Sun-Devil-Sync-Clone/asu_replica/blockchain
  npx hardhat compile
  npx hardhat run scripts/deploy-sdc.js --network polygonAmoy
  ```
  Copy the address to `SDC_TOKEN_ADDRESS` in `.env` (decimals default to 18; set `SDC_DECIMALS` if you change it).
- The app uses `PRIVATE_KEY` to send SDC for on-chain transfers; fund that wallet with SDC (and MATIC for gas).
  If `SDC_TOKEN_ADDRESS` is empty, SDC flows run in mock mode.

**API highlights**

- API endpoints are mounted at `/api` (see `routes/auth.js`, `routes/api.js`, `routes/badges.js`).
- Badge routes:
  - `GET /api/badges/status` — shows if blockchain is configured or using mock
  - `GET /api/badges` — list recently minted badges from the off-chain index
  - `POST /api/badges/mint` — admin-only; body must include `studentWallet`, `eventId`, `eventName`, `eventDate`, `achievementType`, `metadataURI`
  - `GET /api/badges/:tokenId` — fetch badge details and token URI for verification pages

**Notes**

- Minted badges are also indexed off-chain in the `minted_badges` table for quick UI lists (on-chain source of truth is the SunDevilBadge contract).
- To change the port, set the `PORT` environment variable before start, e.g. `PORT=4000 npm start`.

**Optional: Static-only preview**

If you only want to preview the static site without the server, from any folder that contains `index.html` you can run a simple static server:

```bash
# using Python 3
python3 -m http.server 8000
# or using npm
npx serve .
```

**Quick mint test (mock mode is fine)**

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
5) Switch to a real chain (local Hardhat or Amoy):
   - Set `MOCK_CHAIN=false` and configure `AMOY_RPC_URL`, `BADGE_CONTRACT_ADDRESS`, and `PRIVATE_KEY` as described above.

**Testing checklist**

- Start the app: `npm start` then open `http://localhost:3000`.
- Auth: use the login modal on `index.html` with `student/password123` (student) and `admin/adminpass123` (admin); ensure the UI updates and `/api/me` returns the logged-in user.
- Groups/Events: on `groups.html` click "Join"; on `events.html` RSVP/un-RSVP and verify spots left updates.
- Badges (mock by default): log in as admin, open `admin.html`, mint a badge, then confirm it appears on `badges.html` and is viewable in `verify.html?tokenId=<id>`.
- API spot checks (new terminal): `curl -s http://localhost:3000/api/badges/status` and `curl -s http://localhost:3000/api/events | head`.

**Troubleshooting**

- If `npm install` fails, ensure you have a recent Node.js installed (use `nvm` to manage versions). If `node: command not found` install Node LTS.
- If port `3000` is in use, either stop the conflicting service or start with another port: `PORT=4000 npm start`.
- Ensure the `asu_replica` folder is writable so `database.sqlite` can be created.

---

Open `http://localhost:3000` after starting the server.
