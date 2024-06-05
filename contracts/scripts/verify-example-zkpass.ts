import { ethers } from "hardhat";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const proof = {
  taskId: "0x3731383733663436383162643432343338623930656535616262356538343336",
  schemaId:
    "0x3934386262323939303965383438316438313065343564343434626265313431",
  uHash: "0xcdd42c7b94b2fdcf75e8e05c111318d4a8660235a24f4808b9a639b371b5bd82",
  publicFieldsHash:
    "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6",
  validator: "0xb1C4C1E1Cdd5Cf69E27A3A08C8f51145c2E12C6a",
  allocatorSignature:
    "0x80c6010146ff1d28c6ab729dc0b1d380fa716e4c86e6ec5ee2fdd8f11b0ae7f62925f5f6db01f7f094a1a1eca22cfdef5fdb0b77e9d965ea1de5d5eb7935cb991c",
  validatorSignature:
    "0xf5f8a018566a057e6e736a4778ac1c9f97c3ed781350851c898ab3ee94b957545775e23b7c3d3da8ddd80afd2c4997c8a747e5b0f33e392a6782250e34e04bd21b",
};

async function main() {
  const zkPassVerifier = await ethers.getContractAt(
    "ZKPassVerifier",
    contractAddress
  );
  const verified = await zkPassVerifier.verify(proof);

  console.log("verified", verified);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
