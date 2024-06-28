import { ethers } from "hardhat";

async function main() {
  const gitHubFundManager = await ethers.getContractAt(
    "GitHubFundManager",
    "0x882d55F00A9fFECBB999757788f1435e86163Ea0"
  );

  // const tx = await gitHubFundManager.withdrawFund(
  //   "0x1",
  //   "Kourin1996",
  //   "0x90036b4f6f5b9bca64c38eb04068cae03219b256",
  //   "178448502556610664718",
  //   "0x65d4Ec89Ce26763B4BEa27692E5981D8CD3A58C7"
  // );

  // await tx.wait();
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
