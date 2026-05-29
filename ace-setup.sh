#!/usr/bin/env bash
# ACE setup — runs BEFORE services start or restart.
# Invoked by `POST /api/run-setup`, the local engine file watcher, and `ace run`.
# Must be idempotent (safe to run many times).
#
# For this blockchain starter the engine starts three services (chain/api/web).
# They depend on (a) installed workspace deps and (b) compiled contract
# artifacts, so we do both here. Without this, the engine can race ahead and
# start `api`/`chain` before `pnpm install` finishes (ENOENT on tsx/hardhat).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "${REPO_ROOT}"

echo "[ace-setup] installing dependencies…"
if command -v pnpm >/dev/null 2>&1; then
  pnpm install
elif command -v npm >/dev/null 2>&1; then
  npm install
else
  echo "[ace-setup] no package manager found — skipping install"
  exit 0
fi

echo "[ace-setup] compiling contracts…"
# Compile Solidity so the chain service can deploy AceToken on boot. Non-fatal
# if it fails here — the chain service also compiles on start.
pnpm run build:contracts || echo "[ace-setup] contract compile failed (will retry on chain start)"

echo "[ace-setup] done"
