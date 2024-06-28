import { ethers } from "hardhat";

// ERC20 1: 0x90036B4F6F5b9BCA64c38eB04068cae03219B256
// ERC20 2: 0x1B56C4a1372820ED7092A2d1Ac86c94257b1E317

async function main() {
  const erc20 = await ethers.deployContract("MyERC20", [
    "SupportToken",
    "ST",
    "0x65d4Ec89Ce26763B4BEa27692E5981D8CD3A58C7",
    ethers.parseEther("10000000000"),
  ]);

  await erc20.waitForDeployment();

  console.log("ERC20 deployed: ", await erc20.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
