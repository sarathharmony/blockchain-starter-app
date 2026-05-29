import { spawn, type ChildProcess } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CONTRACTS_DIR = path.join(ROOT, "contracts");
const NODE_PORT = 8545;

function waitForPort(port: number, host = "127.0.0.1", timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.connect(port, host);
      socket.once("connect", () => {
        socket.end();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(tryConnect, 400);
      });
    };
    tryConnect();
  });
}

const childEnv = { ...process.env };
delete childEnv.NODE_OPTIONS;

function run(command: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true,
      env: childEnv,
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

function shutdown(node: ChildProcess) {
  if (!node.killed) {
    node.kill("SIGTERM");
  }
}

async function main() {
  console.log(`Starting Hardhat node on port ${NODE_PORT}...`);
  const node = spawn("pnpm", ["exec", "hardhat", "node", "--port", String(NODE_PORT)], {
    cwd: CONTRACTS_DIR,
    stdio: "inherit",
    shell: true,
    env: childEnv,
  });

  node.on("exit", (code) => {
    console.log(`Hardhat node exited (${code ?? 0})`);
    process.exit(code ?? 0);
  });

  process.on("SIGINT", () => {
    shutdown(node);
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    shutdown(node);
    process.exit(0);
  });

  await waitForPort(NODE_PORT);
  console.log("Hardhat node ready. Deploying AceToken...");

  const deployCode = await run(
    "pnpm",
    ["exec", "hardhat", "run", "scripts/deploy.ts", "--network", "localhost"],
    CONTRACTS_DIR,
  );
  if (deployCode !== 0) {
    shutdown(node);
    process.exit(deployCode);
  }

  console.log("Deployment written to deployments/local.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
