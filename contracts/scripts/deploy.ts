import { ethers } from "hardhat";

async function main() {
  const gitHubFundManager = await ethers.deployContract("GitHubFundManager", [
    // subscription ID
    2028,
  ]);

  await gitHubFundManager.waitForDeployment();

  console.log(`GitHub Fund Manager is deployed to ${gitHubFundManager.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
