/* eslint-disable no-console */
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const initialOwner = process.env.COIN_INITIAL_OWNER || deployer.address;
  const initialSupplyTokens = process.env.COIN_INITIAL_SUPPLY || "1000000";
  const initialSupplyWei = hre.ethers.parseUnits(initialSupplyTokens, 18);

  console.log("Deploying SunDevilCoin with account:", deployer.address);
  console.log("Initial owner:", initialOwner);
  console.log("Initial supply (tokens):", initialSupplyTokens);

  const SunDevilCoin = await hre.ethers.getContractFactory("SunDevilCoin");
  const contract = await SunDevilCoin.deploy(initialOwner, initialSupplyWei);
  await contract.waitForDeployment();

  console.log("SunDevilCoin deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
