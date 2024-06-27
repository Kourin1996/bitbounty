import { useCallback } from "react";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { ethers } from "ethers";

const SCHEMA_ID = process.env.NEXT_PUBLIC_ZK_PASS_GITHUB_PROFILE_SCHEMA_ID!;

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

    return proof
  }, [githubId]);
};
