/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying SDC with account:", deployer.address);

  const Token = await hre.ethers.getContractFactory("SDCToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  console.log("SDC token deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
