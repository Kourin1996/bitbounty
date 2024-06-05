import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0x086929cB95B3642aB809512e377Fcb06c40cfA49";

async function main() {
  const chainLinkFunctionsCaller = await ethers.getContractAt(
    "ChainLinkFunctionsCaller",
    CONTRACT_ADDRESS
  );
  console.log(
    "latest request Id",
    await chainLinkFunctionsCaller.latestRequestId()
  );
  console.log(
    "latest response",
    ethers.toUtf8String(await chainLinkFunctionsCaller.latestResponse())
  );
  console.log(
    "latest err",
    ethers.toUtf8String(await chainLinkFunctionsCaller.latestErr())
  );

  // const jwt =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZWUwY2E2MS0yZmFiLTQxMTgtYjgyYS03NGY1YWZiZWZhMTMiLCJlbWFpbCI6ImtvdXJpbi5ibG9ja2NoYWluQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmOGM3MTQ0ZmNlYTM4YTA0OWZiNyIsInNjb3BlZEtleVNlY3JldCI6IjhhYTY0NjEwMDA0MWU3YTljOGVjOWM2NWM3OWU1NDM3ZWE1ZWVjMzc1ZWI4YzU2YzFlYWNmOWQ3MGI5ODI1OGMiLCJpYXQiOjE3MTc1NDc1NjN9.KwAaH81lxvuIie9I1pWj4AukDEPy-74KJ52rxBF1uns";

  // const options = {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${jwt}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     pinataMetadata: {
  //       name: "test.json",
  //     },
  //     pinataContent: {
  //       hello: "world",
  //     },
  //   }),
  // };

  // fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", options)
  //   .then((response) => response.json())
  //   .then((response) => console.log(response))
  //   .catch((err) => console.error(err));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
