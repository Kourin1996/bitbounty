"use client";

import { Accordion, AccordionItem, Avatar, Button, Card, CardHeader, Divider, Skeleton } from "@nextui-org/react";
import { useGitHubRepository } from "@hooks/useGitHubRepository";
import clsx from "clsx";
import { useGitHubContributors } from "@hooks/useGitHubContributors";
import { useCallback, useMemo, useState } from "react";
import styles from "./styles.module.css";
import { useERC20Metadata } from "@hooks/useERC20Metadata";
import formatUnitsWithFixedDecimalPoints from "@utils/format";
import { writeContract } from '@wagmi/core'
import GitHubFundManagerABI from "@constants/GitHubFundManager.json";
import { config } from "@app/providers";
import { useAccount, useClient } from "wagmi";
import { IoClose } from "react-icons/io5";
import { waitForTransactionReceipt } from "viem/actions";

const FUND_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_GITHUB_FUND_MANAGER! as string

type ContributorTokenProps = {
  repositoryId: string;
  tokenAddress: string;
  distributed: string;
  withdrawn: string;
  isWithdrawable: boolean;
  withdrawing: boolean;
  onClickWithdraw: (repositoryId: string, tokenAddress: string, amount: BigInt) => void;
}

const ContributorToken = ({ repositoryId, tokenAddress, distributed, withdrawn, isWithdrawable, withdrawing, onClickWithdraw }: ContributorTokenProps) => {
  const erc20MetadataQuery = useERC20Metadata(tokenAddress);

  const showsWithdrawButton = useMemo(() => {
    if (!isWithdrawable) return false;

    return BigInt(distributed) > BigInt(withdrawn);
  }, [isWithdrawable, distributed, withdrawn]);

  const formattedDistributed = useMemo(() => {
    if (!erc20MetadataQuery.data) return undefined;
    if (!distributed) return `0 ${erc20MetadataQuery.data.symbol}`

    const value = formatUnitsWithFixedDecimalPoints(distributed, erc20MetadataQuery.data.decimals!, 2);

    return `${value} ${erc20MetadataQuery.data.symbol}`;
  }, [erc20MetadataQuery.data, distributed]);

  const formattedwithdrawn = useMemo(() => {
    if (!erc20MetadataQuery.data) return undefined;
    if (!withdrawn) return `0 ${erc20MetadataQuery.data.symbol}`

    const value = formatUnitsWithFixedDecimalPoints(withdrawn, erc20MetadataQuery.data.decimals!, 2);

    return `${value} ${erc20MetadataQuery.data.symbol}`;
  }, [erc20MetadataQuery.data, withdrawn]);

  const onClickButton = useCallback(() => {
    const available = BigInt(distributed) - BigInt(withdrawn);

    onClickWithdraw(repositoryId, tokenAddress, available);
  }, [onClickWithdraw, repositoryId, tokenAddress, distributed, withdrawn]);

  return (
    <div className="flex">
      <div className="flex items-center gap-2">
        <Skeleton isLoaded={erc20MetadataQuery.isFetched} className="flex rounded-full w-6 h-6">
          <Avatar
            className="w-6 h-6"
            radius="full"
            showFallback={true}
            src={undefined}
            name={erc20MetadataQuery.data?.name}
          />
        </Skeleton>
        <Skeleton isLoaded={erc20MetadataQuery.isFetched} className={clsx(erc20MetadataQuery.isLoading && ['rounded-lg', 'w-[100px]', 'max-h-[1em]'])}>
          <span className="text-sm font-semibold">
            {erc20MetadataQuery.data?.name}
          </span>
        </Skeleton>
        {showsWithdrawButton && (
          <div>
            <Button size="sm" variant="flat" color="primary" isDisabled={withdrawing} onClick={onClickButton}>Withdraw</Button>
          </div>
        )}
      </div>
      <div className="ml-auto flex gap-8">
        <div className="ml-auto flex flex-col items-end">
          <span className="text-right text-xs text-[#888888]">
            Distributed
          </span>
          <Skeleton isLoaded={formattedDistributed !== undefined} className={clsx(formattedDistributed === undefined && ['rounded-lg', 'w-[60px]', 'min-h-[1em]', 'mt-1'])}>
            <span className="text-right text-bold">{formattedDistributed}</span>
          </Skeleton>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-right text-xs text-[#888888]">
            Withdrawn
          </span>
          <Skeleton isLoaded={formattedwithdrawn !== undefined} className={clsx(formattedwithdrawn === undefined && ['rounded-lg', 'w-[60px]', 'min-h-[1em]', 'mt-1'])}>
            <span className="text-right text-bold">{formattedwithdrawn}</span>
          </Skeleton>
        </div>
      </div>
    </div>
  )
}

type Contribution = {
  repositoryId: string;
  organization: string;
  repository: string;
  fundTimes: string;
  tokens: {
    address: string;
    distributed: string;
    withdrawn: string;
  }[];
}

type ContributionCardProps = {
  orgAndName: string;
  userLogin: string;
  contribution: Contribution;
  isWithdrawable: boolean;
  withdrawing: boolean;
  onClickWithdraw: (repositoryId: string, tokenAddress: string, amount: BigInt) => void;
}

const ContributionCard = ({ orgAndName, userLogin, contribution, isWithdrawable, withdrawing, onClickWithdraw }: ContributionCardProps) => {
  const repo = useGitHubRepository(orgAndName);

  const [isOpen, setIsOpen] = useState(false);

  const contributorsQuery = useGitHubContributors(orgAndName);
  const contributions = useMemo<string | undefined>(() => {
    return contributorsQuery.data !== undefined ? contributorsQuery.data.find((x: any) => x.login === userLogin)?.contributions : undefined;
  }, [userLogin, contributorsQuery.data]);

  const numberOfWithdrawables = useMemo(() => {
    return contribution.tokens.filter((x) => BigInt(x.distributed) > BigInt(x.withdrawn)).length
  }, [contribution.tokens]);

  const accordionKeys = useMemo(() => isOpen ? new Set(["details"]) : new Set<string>(), [isOpen]);
  const tokens = contribution.tokens;

  return (
    <Card className={styles['contributions-accordion']}>
      <Accordion selectedKeys={accordionKeys} showDivider={false}>
        <AccordionItem key="details" className={styles['contributions-card-title']} onClick={() => setIsOpen(!isOpen)}
          startContent={
            <Skeleton isLoaded={repo.isFetched} className="flex rounded-full w-12 h-12">
              <Avatar
                className="w-12 h-12"
                radius="full"
                showFallback={false}
                fallback={null}
                src={repo.data?.avatar}
              />
            </Skeleton>
          }
          title={
            <div className="w-full flex flex-row items-center gap-4">
              <div className="flex flex-col justify-center gap-2">
                <Skeleton isLoaded={repo.isFetched} className={clsx(repo.isFetching && ['h-3', 'w-60', 'rounded-lg'])}>
                  <span className="text-sm font-extrabold">{repo.data?.name}</span>
                </Skeleton>
              </div>
              <div className="ml-auto flex flex-col justify-center items-end gap-2">
                <Skeleton isLoaded={contributorsQuery.isFetched} className={clsx(repo.isFetching && ['h-3', 'w-20', 'rounded-lg'])}>
                  <span className="ml-auto text-sm text-right">{`${contributions} contributions`}</span>
                </Skeleton>
                <Skeleton isLoaded={repo.isFetched} className={clsx(repo.isFetching && ['h-3', 'w-20', 'rounded-lg'])}>
                  <span className="ml-auto text-sm text-right">{`${numberOfWithdrawables} tokens withdrawable`}</span>
                </Skeleton>
              </div>
            </div>
          }>
          <div className="px-8 pt-2 pb-6 cursor-pointer flex flex-col gap-2" onClick={() => setIsOpen(!isOpen)}>
            {tokens.map((x, i) => (
              <>
                <ContributorToken
                  key={x.address}
                  repositoryId={contribution.repositoryId}
                  tokenAddress={x.address}
                  withdrawn={x.withdrawn}
                  distributed={x.distributed}
                  isWithdrawable={isWithdrawable}
                  withdrawing={withdrawing}
                  onClickWithdraw={onClickWithdraw}
                />
                {i < tokens.length - 1 && (
                  <Divider className="my-4" />
                )}
              </>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}

const SkeltoonContributionCard = () => {
  return (
    <Card isHoverable className="py-4 px-6 w-full flex flex-row gap-6 cursor-pointer">
      <Skeleton className="flex rounded-full w-12 h-12" />
      <div className="flex flex-col justify-center gap-2">
        <Skeleton className={clsx('h-3', 'w-60', 'rounded-lg')} />
      </div>
      <div className="ml-auto flex flex-col justify-center gap-2">
        <Skeleton className={clsx('h-3', 'w-20', 'rounded-lg')} />
        <Skeleton className={clsx('h-3', 'w-20', 'rounded-lg')} />
      </div>
    </Card>
  )
}

type Props = {
  loading: boolean;
  userLogin: string;
  contributions: Contribution[];
  isWithdrawable: boolean;
  onRefetch: () => void;
}

export const UserContributions = ({ loading, userLogin, contributions, isWithdrawable, onRefetch }: Props) => {
  const account = useAccount();
  const client = useClient();

  const [withdrawing, setWithdrawing] = useState(false);
  const [showsSuccessMessage, setShowsSuccessMessage] = useState(false);

  const onClickWithdraw = useCallback(async (
    repositoryId: string,
    tokenAddress: string,
    amount: BigInt,
  ) => {
    try {
      setWithdrawing(true);

      const txHash = await writeContract(config, {
        abi: GitHubFundManagerABI,
        address: FUND_MANAGER_ADDRESS as `0x${string}`,
        functionName: 'withdrawFund',
        args: [
          repositoryId,
          userLogin,
          tokenAddress,
          amount.toString(),
          account.address,
        ]
      });

      const txReceipt = await waitForTransactionReceipt(client!, {
        hash: txHash as `0x${string}`,
      });

      console.log('debug::withdrew', txReceipt);
      onRefetch();
      setShowsSuccessMessage(true);
      setTimeout(() => setShowsSuccessMessage(false), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setWithdrawing(false);
    }
  }, [userLogin, client, account, onRefetch]);

  return (
    <div className="flex flex-col">
      <h2 className="w-full text-left text-[#ECEDEE] text-[18px] font-bold">
        Contributions
      </h2>
      <div className="w-full flex flex-col mt-4 gap-4">
        {contributions.map((contribution) => {
          const orgAndName = `${contribution.organization}/${contribution.repository}`

          return (
            <ContributionCard key={orgAndName} orgAndName={orgAndName} userLogin={userLogin} contribution={contribution} isWithdrawable={isWithdrawable} withdrawing={withdrawing} onClickWithdraw={onClickWithdraw} />
          )
        })}
        {loading && new Array(3).fill(null).map((_, i) => <SkeltoonContributionCard key={i} />)}
      </div>
      {showsSuccessMessage && (
        <div className="fixed bottom-4 right-4">
          <Card shadow="lg">
            <CardHeader className="flex gap-4 px-6 py-4">
              <span className="text-sm">
                Token has been withdrawn successfully
              </span>
              <div className="flex justify-end cursor-pointer" onClick={() => setShowsSuccessMessage(false)}>
                <IoClose />
              </div>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
};
