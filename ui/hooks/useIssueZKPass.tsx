"use client";
import { useCallback, useEffect } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { useGenerateGitHubAccountProof } from ".//useGenerateGitHubAccountProof";
import { useGitHubAccount } from "./useGitHubAccount";
import Web3 from "web3";

const abi = require("../constants/abi.json");

export const useIssueZKPass = () => {
  const githubProfile = useGitHubAccount();
  const result = useReadContract({
    abi,
    address: process.env.NEXT_PUBLIC_GITHUB_FUND_MANAGER! as any,
    functionName: "hasGitHubPass",
    args: [githubProfile.data?.login! as any],
  });

  const { writeContract, isSuccess } = useWriteContract();
  const generateProof = useGenerateGitHubAccountProof(
    githubProfile.data?.login!
  );

  const onClick = useCallback(async () => {
    console.log(
      "debug::generating zkPass",
      "github",
      githubProfile.data?.login!
    );

    const proof = await generateProof();
    console.log("debug::proof", proof);

    // try {
    //   writeContract({
    //     abi,
    //     address: process.env.NEXT_PUBLIC_GITHUB_FUND_MANAGER! as any,
    //     functionName: "registerGitHubPass",
    //     args: [
    //       githubProfile.data?.login!,
    //       Web3.utils.stringToHex(proof!.taskId),
    //       Web3.utils.stringToHex(
    //         process.env.NEXT_PUBLIC_ZK_PASS_SCHEMA_GITHUB_PROFILE!
    //       ),
    //       proof!.uHash,
    //       proof!.publicFieldsHash,
    //       proof!.allocatorAddress,
    //       proof!.allocatorSignature,
    //       proof!.validatorAddress,
    //       proof!.validatorSignature,
    //     ],
    //   });
    // } catch (error) {
    //   console.error(error);
    // }
  }, [githubProfile.data?.login]);

  useEffect(() => {
    if (isSuccess) {
      result.refetch();
    }
  }, [isSuccess, result]);

  return onClick;
};
