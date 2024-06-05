import { ethers } from "hardhat";

async function main() {
  let chainLinkFunctionsCaller = await ethers.deployContract(
    "ChainLinkFunctionsCaller",
    [2028]
  );
  chainLinkFunctionsCaller = await chainLinkFunctionsCaller.waitForDeployment();

  console.log(
    `ChainLinkFunctionsCaller deployed to ${await chainLinkFunctionsCaller.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
