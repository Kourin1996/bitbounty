import { ethers } from "hardhat";

// // https://docs.chain.link/chainlink-functions/supported-networks
// // Ethereum Sepolia
// address chainLinkFunctionsRouter = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
// bytes32 chainLinkFunctionsDonID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

async function main() {
  const gitHubFundManager = await ethers.deployContract("GitHubFundManager", [
    // ChainLink Functions Router
    "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
    // ChainLink Functions DonID
    "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
    // ChainLink Functions Subscription ID
    3146,
    // ChainLink JWT Secrets URL
    '0xcdfcb7d87dd21be22b6c234f71c0d68403dc23614a373982882e8f348d2c31792f526011ec66b1fa877d3c6679328185c1a4dbb6acf93772ddce958daa33e60e31226b08231fda1eb1cd145da69672c2e3eb56224794216bbd32cbd3e47f70f4db2dc7b046d6d1145f7644472f694fcbc997274eaaf5c5dd38616b1fdb4a389798d9db042d814437c15efa042971b12a32196885fa5a56c295f2682a7579b6f527',
    // Risc0 verifier
    "0x36Be51Af39A2D430368Ffee8C664C46d2298083D",
    // Risc0 Image ID
    "0xe89eb53aef1d05d87ebaf657d8b579a983f4ad5ead789fbcbe16e36b3be15104",
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
