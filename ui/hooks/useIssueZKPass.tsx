"use client";
import { useCallback } from "react";
import { useClient, useReadContract } from "wagmi";
import { writeContract } from '@wagmi/core'
import { useGenerateGitHubAccountProof } from ".//useGenerateGitHubAccountProof";
import GitHubFundManagerABI from "@constants/GitHubFundManager.json";
import { config } from "@app/providers";
import { waitForTransactionReceipt } from "viem/actions";

export const useIssueZKPass = (githugLogin: string) => {
  const client = useClient();
  const generateProof = useGenerateGitHubAccountProof(
    githugLogin,
  );

  const onClick = useCallback(async () => {
    console.log(
      "debug::generating zkPass",
      "github",
      githugLogin,
    );

    const proof = await generateProof();
    console.log("debug::proof", proof);

    try {
      const txHash = await writeContract(config, {
        abi: GitHubFundManagerABI,
        address: process.env.NEXT_PUBLIC_GITHUB_FUND_MANAGER! as `0x${string}`,
        functionName: 'registerGitHubPass',
        args: [
          githugLogin,
          proof,
        ]
      });

      const txReceipt = await waitForTransactionReceipt(client!, {
        hash: txHash,
      });

      console.log('GitHub registered', txReceipt);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, [githugLogin, client, generateProof]);

  return onClick;
};
