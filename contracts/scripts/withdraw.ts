import { ethers } from "hardhat";

async function main() {
  const gitHubFundManager = await ethers.getContractAt(
    "GitHubFundManager",
    "0xb6E85Fb580141A568d95ea9f2c4C8a0A5D57e500"
  );

  const tx = await gitHubFundManager.withdrawFund(0, "Kourin1996");

  await tx.wait();
}

// address:                         00DE65653Bb0C76eaE4E51F6Fee6821dDBa13d1e
// bytes32: 00000000000000000000000000de65653bb0c76eae4e51f6fee6821ddba13d1e

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
