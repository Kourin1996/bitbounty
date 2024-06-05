import { ethers } from "hardhat";

async function main() {
  let zkPassVerifier = await ethers.deployContract("ZKPassVerifier");
  zkPassVerifier = await zkPassVerifier.waitForDeployment();

  console.log(
    `ZKPassVerifier deployed to ${await zkPassVerifier.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
