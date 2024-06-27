"use client";

import { Accordion, AccordionItem, Button, Card, CardBody, CardFooter, CardHeader, Input } from "@nextui-org/react";
import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useClient,
  useReadContracts,
} from "wagmi";
import { writeContract, readContract } from '@wagmi/core'
import * as ethers from "ethers";
import ERC20 from "@constants/ERC20.json";
import GitHubFundManagerABI from "@constants/GitHubFundManager.json";
import { Header } from "@components/Header";
import { config } from "@app/providers";
import { waitForTransactionReceipt } from "viem/actions";
import { IoChevronBack, IoClose } from "react-icons/io5";
import Link from "next/link";
import styles from "./styles.module.css";
import { ProgressInfo } from "./ProgressInfo";
import axios from "axios";

const FUND_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_GITHUB_FUND_MANAGER! as string
const API_URL = process.env.NEXT_PUBLIC_API_URL! as string;

const useERC20Data = (tokenAddress?: string) => {
  const account = useAccount();

  const { data: erc20Metadata } = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}` | undefined,
        abi: ERC20,
        functionName: 'symbol',
      },
      {
        address: tokenAddress as `0x${string}` | undefined,
        abi: ERC20,
        functionName: 'decimals',
      },
      {
        address: tokenAddress as `0x${string}` | undefined,
        abi: ERC20,
        functionName: 'allowance',
        args: [
          account.address,
          FUND_MANAGER_ADDRESS,
        ]
      }
    ],
  });

  return useMemo(() => {
    return [
      erc20Metadata?.at(0)?.result as string | undefined,
      erc20Metadata?.at(1)?.result as number | undefined,
      erc20Metadata?.at(2)?.result as number | undefined,
    ] as const;
  }, [erc20Metadata]);
}

export default function Home({ params }: { params: { org: string; repo: string } }) {
  const { org, repo } = params;
  const orgAndName = `${org}/${repo}`

  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [transactionStep, setTransactionStep] = useState(0);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const [tokenSymbol, tokenDecimals, tokenAllowance] = useERC20Data(token);

  const client = useClient();

  const approveTransfer = useCallback(async (tokenAddress: string, value: bigint) => {
    console.log('debug::approving', {
      abi: ERC20,
      address: tokenAddress as `0x${string}`,
      functionName: 'approve',
      args: [
        FUND_MANAGER_ADDRESS,
        value
      ]
    });

    const txHash = await writeContract(config, {
      abi: ERC20,
      address: tokenAddress as `0x${string}`,
      functionName: 'approve',
      args: [
        FUND_MANAGER_ADDRESS,
        value
      ]
    });

    console.log('sent approve tx', txHash);

    const txReceipt = await waitForTransactionReceipt(client!, {
      hash: txHash,
    });

    console.log('debug::approved', txReceipt);
  }, [client, FUND_MANAGER_ADDRESS]);

  const fundToken = useCallback(async (tokenAddress: string, value: bigint) => {
    console.log('funding', {
      abi: GitHubFundManagerABI,
      address: FUND_MANAGER_ADDRESS as `0x${string}`,
      functionName: 'fundRepository',
      args: [
        org,
        repo,
        tokenAddress,
        value
      ]
    });

    const txHash = await writeContract(config, {
      abi: GitHubFundManagerABI,
      address: FUND_MANAGER_ADDRESS as `0x${string}`,
      functionName: 'fundRepository',
      args: [
        org,
        repo,
        tokenAddress,
        value
      ]
    });

    console.log('sent fund tx', txHash);

    const txReceipt = await waitForTransactionReceipt(client!, {
      hash: txHash,
    });

    console.log('debug::funded', txReceipt);

    const iface = new ethers.Interface(GitHubFundManagerABI);
    for (const log of txReceipt.logs ?? []) {
      const parsedLog = iface.parseLog(log);
      if (parsedLog?.name === "TokenFundedToRepository") {
        const [repositoryIndex, fundIndex] = parsedLog.args;

        return [repositoryIndex as bigint, fundIndex as bigint]
      }
    }

    throw new Error('invalid tx logs');
  }, [client, org, repo]);

  const waitForChainLinkFunctionCompleted = useCallback(async (fundIndex: bigint) => {
    while (true) {
      const result = await readContract(config, {
        abi: GitHubFundManagerABI,
        address: FUND_MANAGER_ADDRESS as `0x${string}`,
        functionName: 'getFundIpfsHash',
        args: [fundIndex]
      }) as string;

      console.log('debug::getFundIpfsHash', result);

      if (result.length !== 0) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }, [config]);

  const onClickFund = useCallback(async () => {
    if (!amount || !token || !tokenDecimals || tokenAllowance === undefined) return;

    setSending(true);
    setTransactionStep(0);

    const value = ethers.parseUnits(amount, tokenDecimals);

    try {
      // 1. Approve
      setTransactionStep(1);

      if (value > tokenAllowance) {
        await approveTransfer(token, value);
      }

      // 2. Funding
      setTransactionStep(2);
      const [repositoryIndex, fundIndex] = await fundToken(token, value);
      console.log('funded', 'repositoryIndex', repositoryIndex, 'fundIndex', fundIndex);

      // 3. Awaiting GitHub contributions uploaded
      setTransactionStep(3);
      await waitForChainLinkFunctionCompleted(fundIndex);

      // 4. Call Risc0
      console.log('debug::call api', {
        chain_id: '0xaa36a7',
        contract_address: FUND_MANAGER_ADDRESS,
        fund_index: ethers.toBeHex(fundIndex),
      });

      setTransactionStep(4);
      const res = await axios.post<{ hash: string }>(`${API_URL}/prove/distributions`, {
        chain_id: '0xaa36a7',
        contract_address: FUND_MANAGER_ADDRESS,
        fund_index: ethers.toBeHex(fundIndex),
      });

      console.log('debug::API returns res', res.data);
      const txReceipt = await waitForTransactionReceipt(client!, {
        hash: res.data.hash as `0x${string}`,
      });
      console.log('debug::receipt', txReceipt);

      setTransactionStep(5);
      setCompleted(true);

      setIsMessageDialogOpen(true);
      setTimeout(() => {
        setIsMessageDialogOpen(false);
      }, 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  }, [orgAndName, token, amount, client]);

  const isButtonDisabled = !token || !amount || !tokenDecimals || completed;
  const accordionKeys = useMemo(() => sending || completed ? new Set(["details"]) : new Set<string>(), [sending, completed]);
  const buttonText = useMemo(() => {
    if (sending) {
      return 'Executing'
    }
    if (completed) {
      return 'Completed';
    }

    return 'Fund';
  }, [sending, completed]);

  return (
    <main className="flex flex-col min-h-screen pt-8 px-16">
      <Header showsGitHubButton />
      <div className="mt-8">
        <Link href={`/organizations/${org}/repositories/${repo}`} className="flex cursor-pointer gap-2 items-center">
          <IoChevronBack />
          <span>Back to Repository</span>
        </Link>
      </div>
      <h1 className="mt-12 text-left text-[#ECEDEE] text-lg font-bold text-center">
        Fund {orgAndName}
      </h1>
      <Card className="mt-6 mx-auto" style={{ minWidth: '600px', maxWidth: '800px' }}>
        <CardBody className="py-0 pt-4 px-12 flex flex-col">
          <Input
            variant="underlined"
            label="Token Address"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            isDisabled={sending || completed}
          />
          <Input
            type="number"
            variant="underlined"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            endContent={tokenSymbol ? <span>{tokenSymbol}</span> : undefined}
            isDisabled={sending || completed}
          />
        </CardBody>
        <CardFooter className="flex flex-col items-center py-0 pt-4 pb-4 gap-4">
          <Accordion selectedKeys={accordionKeys} showDivider={false} className={styles.accordion}>
            <AccordionItem key="details" hideIndicator className="px-10">
              <ProgressInfo step={transactionStep} />
            </AccordionItem>
          </Accordion>
          <Button color="primary" onClick={onClickFund} isLoading={sending} isDisabled={isButtonDisabled}>
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
      {isMessageDialogOpen && (
        <div className="fixed bottom-4 right-4">
          <Card shadow="lg">
            <CardHeader className="flex gap-4 px-6 py-4">
              <span className="text-sm">
                Token has been distributed to contributors!
              </span>
              <div className="flex justify-end cursor-pointer" onClick={() => setIsMessageDialogOpen(false)}>
                <IoClose />
              </div>
            </CardHeader>
          </Card>
        </div>
      )}
    </main>
  );
}
