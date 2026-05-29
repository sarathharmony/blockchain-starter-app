import express from "express";
import { ethers } from "ethers";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
] as const;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const PORT = Number(process.env.PORT ?? 4002);
const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";
const DEPLOYMENTS_PATH =
  process.env.DEPLOYMENTS_PATH ?? path.join(ROOT, "deployments/local.json");

type DeploymentFile = {
  AceToken: { address: string };
};

function loadDeployment(): DeploymentFile {
  const raw = fs.readFileSync(DEPLOYMENTS_PATH, "utf-8");
  return JSON.parse(raw) as DeploymentFile;
}

function getTokenContract() {
  const deployment = loadDeployment();
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    deployment.AceToken.address,
    ERC20_ABI,
    provider,
  );
  return { contract, address: deployment.AceToken.address };
}

const app = express();

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/token", async (_req, res) => {
  try {
    const { contract, address } = getTokenContract();
    const [name, symbol, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
    ]);
    res.json({
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      address,
    });
  } catch (err) {
    res.status(503).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/api/balance/:address", async (req, res) => {
  try {
    const addr = req.params.address;
    if (!ethers.isAddress(addr)) {
      res.status(400).json({ error: "Invalid address" });
      return;
    }
    const { contract, address: tokenAddress } = getTokenContract();
    const balance = await contract.balanceOf(addr);
    res.json({
      address: addr,
      token: tokenAddress,
      balance: balance.toString(),
    });
  } catch (err) {
    res.status(503).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
