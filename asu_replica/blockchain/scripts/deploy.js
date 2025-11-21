/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const SunDevilBadge = await hre.ethers.getContractFactory("SunDevilBadge");
  const contract = await SunDevilBadge.deploy();
  await contract.waitForDeployment();

  console.log("SunDevilBadge deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
