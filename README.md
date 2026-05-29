# Blockchain Starter (EVM)

A starter for building simple blockchain (EVM) apps on ACE: a local Hardhat
chain, an indexer/REST API, and a React wallet UI. Built and published via
DevLay Master.

Customers create their own copy with:

```
ace createapp blockchain-starter
```

## Services

Services live in `ace.json` under `services[]`. Editing `ace.json` in local mode
auto-reloads the stack via the ACE engine (rediscovers + restarts services).

> This repo starts intentionally minimal — the app (contracts, chain node, API,
> and web UI) is built by the DevLay agent.
