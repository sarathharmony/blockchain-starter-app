# Blockchain Starter (EVM)

A starter for building simple blockchain (EVM) apps on ACE: a local Hardhat
chain, an indexer/REST API, and a React wallet UI. Built and published via
DevLay Master.

Customers create their own copy with:

```
ace createapp blockchain-starter
```

## Monorepo layout

| Path | Role |
|------|------|
| `contracts/` | Hardhat + AceToken (ERC-20, 1M ACE to deployer) |
| `services/chain/` | Hardhat node `:8545` + deploy → `deployments/local.json` |
| `services/api/` | Express API `:4002` |
| `apps/web/` | React + Vite UI `:5174` |

```bash
pnpm install
pnpm run build:contracts   # compile Solidity once
```

Services are declared in `ace.json`; the ACE engine starts them in local mode.

## Services (ports)

| Service | Port | Type |
|---------|------|------|
| chain | 8545 | worker |
| api | 4002 | server (`GET /api/health`) |
| web | 5174 | static |

Manual dev (if not using the engine):

```bash
pnpm run dev:chain   # terminal 1 — wait for deploy
pnpm run dev:api     # terminal 2
pnpm run dev:web     # terminal 3
```

Hardhat’s first account (`0xf39Fd…`) holds the full ACE supply after deploy.
