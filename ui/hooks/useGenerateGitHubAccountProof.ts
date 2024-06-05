import { useCallback } from "react";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { ethers } from "ethers";
import { createPublicClient, http } from "viem";
import { localhost } from "viem/chains";

// all hex except for publicFields
type ConnectorResult = {
  allocatorAddress: string;
  allocatorSignature: string;
  publicFields: string[];
  publicFieldsHash: string;
  taskId: string;
  uHash: string;
  validatorAddress: string;
  validatorSignature: string;
};

const launchResExample = {
  taskId: "0x6166643834663763636665313461646539383737393331363038366265393536",
  schemaId:
    "0x3934386262323939303965383438316438313065343564343434626265313431",
  uHash: "0xcdd42c7b94b2fdcf75e8e05c111318d4a8660235a24f4808b9a639b371b5bd82",
  publicFieldsHash:
    "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6",
  validator: "0xb1C4C1E1Cdd5Cf69E27A3A08C8f51145c2E12C6a",
  allocatorSignature:
    "0x35ffe0801a383939ed714191c48cc1639f41bb5fcdd54dcda966043c8e3b292b704ac91d796744c59cdf6065d279373101ab34a54d439cd94e54665e100a717a1c",
  validatorSignature:
    "0xece82188beb50a6dbf6aceb2d6fde78616f1726efd4afbeb8df98dcbdf79b59b0e42e15a8d92dfebbe7284a213087d0d6bb8fb47b3a4d21e2bdae7bdd71e0c251c",
};

const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});

const ZK_PASS_VERIFIER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ZK_PASS_VERIFIER_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "defaultAllocator",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "taskId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "schemaId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "uHash",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "publicFieldsHash",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "validator",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "allocatorSignature",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "validatorSignature",
            type: "bytes",
          },
        ],
        internalType: "struct Proof",
        name: "_proof",
        type: "tuple",
      },
    ],
    name: "verify",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_taskId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_schemaId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_validator",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_allocatorSignature",
        type: "bytes",
      },
    ],
    name: "verifyAllocatorSignature",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_taskId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_schemaId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_uHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_publicFieldsHash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_validator",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_validatorSignature",
        type: "bytes",
      },
    ],
    name: "verifyValidatorSignature",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const SCHEMA_ID = process.env.NEXT_PUBLIC_ZK_PASS_GITHUB_PROFILE_SCHEMA_ID!;

export const useGenerateGitHubAccountProof = (githubId: string) => {
  return useCallback(async () => {
    console.log("debug::useGenerateGitHubAccountProof", githubId);

    const connector = new TransgateConnect(
      process.env.NEXT_PUBLIC_ZK_PASS_APP_ID!
    );

    const isAvailable = await connector.isTransgateAvailable();
    if (!isAvailable) {
      prompt("Please install TransGate");
      return;
    }

    const res = (await connector.launch(SCHEMA_ID)) as ConnectorResult;
    // const res = launchResExample;

    console.log("debug::zkPass launch res", res);

    const githubIdHash = ethers.sha256(ethers.toUtf8Bytes(githubId));
    if (githubIdHash !== res.uHash) {
      throw new Error("Wrong uHash");
    }

    const taskId = ethers.hexlify(ethers.toUtf8Bytes(res.taskId));
    const schemaId = ethers.hexlify(ethers.toUtf8Bytes(SCHEMA_ID));
    const proof = {
      taskId,
      schemaId,
      uHash: res.uHash,
      publicFieldsHash: res.publicFieldsHash,
      validator: res.validatorAddress,
      allocatorSignature: res.allocatorSignature,
      validatorSignature: res.validatorSignature,
      // recipient: account,
    };

    console.log("debug::proof", proof);

    const verified = await publicClient.readContract({
      address: ZK_PASS_VERIFIER_ADDRESS,
      abi: ZK_PASS_VERIFIER_ABI,
      functionName: "verify",
      args: [proof],
    });

    // TODO: submit proof and hash of github ID

    console.log("debug::verified", verified);

    if (!verified) {
      throw new Error("Proof verification failed");
    }

    return {
      res,
    };
  }, [githubId]);
};
