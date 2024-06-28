import { ethers } from "hardhat";

const ERC20_CONTRACT_ADDRESS = "0x90036B4F6F5b9BCA64c38eB04068cae03219B256";
const FUND_MANAGER_CONTRACT_ADDRESS =
  "0x7131932c18642db677df3e172E1EECbF47C507a9";

const amount = ethers.parseEther("1000");

async function main(org: string, repo: string) {
  const [wallet] = await ethers.getSigners();

  const fundManager = await ethers.getContractAt(
    "GitHubFundManager",
    FUND_MANAGER_CONTRACT_ADDRESS
  );
  const erc20 = await ethers.getContractAt("MyERC20", ERC20_CONTRACT_ADDRESS);

  console.log("balance", await erc20.balanceOf(wallet.address));

  const tx1 = await erc20.approve(FUND_MANAGER_CONTRACT_ADDRESS, amount);
  console.log("ERC20 approving: ", tx1.hash);
  const receipt1 = await tx1.wait();
  console.log("tx1 confirmed", receipt1?.status);

  const tx2 = await fundManager.fundRepository(
    org,
    repo,
    ERC20_CONTRACT_ADDRESS,
    amount
  );
  console.log("funding: ", tx2.hash);
  const receipt2 = await tx2.wait();
  console.log("tx2 confirmed", receipt2?.status);

  const iface = fundManager.interface;
  for (const log of receipt2?.logs ?? []) {
    const parsedLog = iface.parseLog(log);
    if (parsedLog?.name === "TokenFundedToRepository") {
      const [repositoryIndex, fundIndex] = parsedLog.args;
      console.log({ repositoryIndex, fundIndex });
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main("0xPolygon", "polygon-edge").catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
