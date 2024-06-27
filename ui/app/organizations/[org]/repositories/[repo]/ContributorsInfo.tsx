"use client";

import { useGraphRepositoryContributors } from "@hooks/graph/useRepositoryContributors";
import { useERC20Metadata } from "@hooks/useERC20Metadata";
import { useGitHubContributors } from "@hooks/useGitHubContributors";
import { Accordion, AccordionItem, Avatar, Card, CardBody, Skeleton } from "@nextui-org/react";
import formatUnitsWithFixedDecimalPoints from "@utils/format";
import clsx from "clsx";
import { useMemo } from "react";

type ContributorTokenProps = {
  tokenAddress: string;
  distributed?: string;
  withdrawn?: string;
}

const ContributorToken = ({ tokenAddress, distributed, withdrawn }: ContributorTokenProps) => {
  const erc20MetadataQuery = useERC20Metadata(tokenAddress);

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

  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-3">
        <Skeleton isLoaded={erc20MetadataQuery.isFetched} className="flex rounded-full w-6 h-6">
          <Avatar
            className="w-6 h-6"
            radius="full"
            showFallback={true}
            // src={token.tokenImgSrc}
            src={undefined}
            name={erc20MetadataQuery.data?.name}
          />
        </Skeleton>
        <Skeleton isLoaded={erc20MetadataQuery.isFetched} className={clsx(erc20MetadataQuery.isLoading && ['rounded-lg', 'w-[100px]', 'max-h-[1em]'])}>
          <span className="text-xs font-semibold">
            {erc20MetadataQuery.data?.name}
          </span>
        </Skeleton>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <span className="text-right text-xs text-[#888888]">
          Distributed
        </span>
        <Skeleton isLoaded={formattedDistributed !== undefined} className={clsx(formattedDistributed === undefined && ['rounded-lg', 'w-[60px]', 'min-h-[1em]', 'mt-1'])}>
          <span className="text-right text-bold text-sm">{formattedDistributed}</span>
        </Skeleton>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <span className="text-right text-xs text-[#888888]">
          Withdrawn
        </span>
        <Skeleton isLoaded={formattedwithdrawn !== undefined} className={clsx(formattedwithdrawn === undefined && ['rounded-lg', 'w-[60px]', 'min-h-[1em]', 'mt-1'])}>
          <span className="text-right text-bold text-sm">{formattedwithdrawn}</span>
        </Skeleton>
      </div>
    </div>
  )
}

type ContributorTokensProps = {
  githubName: string;
  repositoryId: string;
  tokenAddresses: string[];
}

const ContributorTokens = ({ githubName, repositoryId, tokenAddresses }: ContributorTokensProps) => {
  const repositoryFundsQuery = useGraphRepositoryContributors(repositoryId, githubName);

  const amountMap = useMemo<Record<string, { distributed: string; withdrawn: string }>>(() => {
    if (!repositoryFundsQuery.data) return {};

    const m: Record<string, { distributed: string; withdrawn: string }> = {};
    repositoryFundsQuery.data.forEach((x) => {
      m[x.tokenAddress] = {
        distributed: x.distributed,
        withdrawn: x.withdrawn
      }
    });

    return m;
  }, [repositoryFundsQuery.data]);

  return (
    <div className="mt-4 flex flex-col gap-2">
      {tokenAddresses.map((tokenAddress) => (
        <ContributorToken
          key={tokenAddress}
          tokenAddress={tokenAddress}
          distributed={amountMap[tokenAddress]?.distributed}
          withdrawn={amountMap[tokenAddress]?.withdrawn}
        />
      ))}
    </div>
  )
}

type ContributorCardProps = {
  imgSrc?: string;
  name: string;
  contributions: number;
  repositoryId?: string;
  tokenAddresses: string[];
}

const ContributorCard = ({ imgSrc, name, contributions, repositoryId, tokenAddresses }: ContributorCardProps) => {
  return (
    <Card className="self-start">
      <CardBody className="py-2 px-4 flex flex-col">
        <Accordion>
          <AccordionItem
            startContent={
              <Avatar
                className="w-9 h-9"
                radius="full"
                showFallback={true}
                src={imgSrc}
              />
            }
            title={
              <div className="flex flex-row items-center">
                <span className="font-bold">
                  {name}
                </span>
                <div className="ml-auto flex flex-col">
                  <span className="text-right text-xs text-[#888888]">
                    Contributions
                  </span>
                  <span className="text-right text-bold">{`${contributions}`}</span>
                </div>
              </div>
            }
          >
            {repositoryId !== undefined && <ContributorTokens githubName={name} repositoryId={repositoryId} tokenAddresses={tokenAddresses} />}
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  )
}

type Props = {
  organization: string;
  repository: string
  repositoryId?: string;
  tokenAddresses: string[];
}

export const ContributorsInfo = ({ organization, repository, repositoryId, tokenAddresses }: Props) => {
  const contributorsQuery = useGitHubContributors(`${organization}/${repository}`);
  const contributors = contributorsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="w-full text-left text-[#ECEDEE] text-[18px] font-bold">Contributors</h2>
      <div className="grid grid-cols-3 gap-4">
        {contributors.map((contributor: { avatar_url: string; login: string; contributions: number }) => (
          <ContributorCard
            key={contributor.login}
            imgSrc={contributor.avatar_url}
            name={contributor.login}
            contributions={contributor.contributions}
            repositoryId={repositoryId}
            tokenAddresses={tokenAddresses}
          />
        ))}
      </div>
    </div>
  )
}