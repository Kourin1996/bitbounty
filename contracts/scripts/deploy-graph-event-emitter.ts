import { ethers } from "hardhat";

async function main() {
  let graphEventEmitter = await ethers.deployContract("GraphEventEmitter");
  graphEventEmitter = await graphEventEmitter.waitForDeployment();

  console.log(
    `GraphEventEmitter deployed to ${await graphEventEmitter.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
