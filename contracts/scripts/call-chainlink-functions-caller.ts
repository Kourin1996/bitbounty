import { ethers } from "hardhat";
const { SecretsManager } = require("@chainlink/functions-toolkit");

// sepolia
const routerAddress = "0x889420c66E618992Ca475fd5cf3A65Dfb6A39062";
const donId = "fun-ethereum-sepolia-1";
const gatewayUrls = [
  "https://01.functions-gateway.testnet.chain.link/",
  "https://02.functions-gateway.testnet.chain.link/",
];

const CONTRACT_ADDRESS = "0x086929cB95B3642aB809512e377Fcb06c40cfA49";

const slotIdNumber = 0;
const donHostedSecretsVersion = 1717550038;

async function main() {
  console.log("calling contract");

  const chainLinkFunctionsCaller = await ethers.getContractAt(
    "ChainLinkFunctionsCaller",
    CONTRACT_ADDRESS
  );
  const tx = await chainLinkFunctionsCaller.fundToRepo(
    "0xPolygon/polygon-edge",
    CONTRACT_ADDRESS,
    100,
    slotIdNumber,
    donHostedSecretsVersion
  );

  console.log("transaction created", tx.hash);

  const receipt = await tx.wait();

  console.log("transaction confirmed", receipt?.status);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
