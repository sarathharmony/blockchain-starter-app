import { ethers } from "hardhat";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const AceToken = await ethers.getContractFactory("AceToken");
  const token = await AceToken.deploy();
  await token.waitForDeployment();
  const address = await token.getAddress();

  const outDir = path.join(__dirname, "../../deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const payload = {
    network: "localhost",
    chainId: 31337,
    AceToken: {
      address,
      deployer: deployer.address,
    },
  };
  fs.writeFileSync(
    path.join(outDir, "local.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  console.log(`AceToken deployed to ${address} (deployer: ${deployer.address})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
