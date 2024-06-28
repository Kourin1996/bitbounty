import { ethers } from "hardhat";

const FUND_MANAGER_CONTRACT_ADDRESS =
  "0x882d55F00A9fFECBB999757788f1435e86163Ea0";

async function main(org: string, repo: string) {
  const fundManager = await ethers.getContractAt(
    "GitHubFundManager",
    FUND_MANAGER_CONTRACT_ADDRESS
  );

  const tx1 = await fundManager.updateRisc0Parameters("0x36Be51Af39A2D430368Ffee8C664C46d2298083D", "0xe89eb53aef1d05d87ebaf657d8b579a983f4ad5ead789fbcbe16e36b3be15104");
  console.log("Updating Risc0 parameters: ", tx1.hash);
  const receipt1 = await tx1.wait();
  console.log("tx confirmed", receipt1?.status);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main("0xPolygon", "polygon-edge").catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
