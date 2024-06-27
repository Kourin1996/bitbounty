"use client";

import { Avatar, Card, CardBody, Skeleton } from "@nextui-org/react";
import { RepositoryFund } from "@hooks/graph/useRepositoryFunds";
import { useERC20Metadata } from "@hooks/useERC20Metadata";
import { useMemo } from "react";
import clsx from "clsx";
import formatUnitsWithFixedDecimalPoints from "@utils/format";

const FundCard = ({ fund }: { fund: RepositoryFund }) => {
  const { tokenAddress, fundedTimes, funded, withdrawn } = fund;

  const imgSrc: string | undefined = undefined;

  const erc20MetadataQuery = useERC20Metadata(tokenAddress);

  const formattedFunded = useMemo(() => {
    if (!erc20MetadataQuery.data) return undefined;

    return formatUnitsWithFixedDecimalPoints(funded, erc20MetadataQuery.data.decimals!, 2)
  }, [erc20MetadataQuery.data, funded]);

  const formattedWithdrawn = useMemo(() => {
    if (!erc20MetadataQuery.data) return undefined;

    return formatUnitsWithFixedDecimalPoints(withdrawn, erc20MetadataQuery.data.decimals!, 2)
  }, [erc20MetadataQuery.data, withdrawn]);

  const tokenName = erc20MetadataQuery.data?.name;
  const tokenSymbol = erc20MetadataQuery.data?.symbol;

  return (
    <Card>
      <CardBody className="py-4 px-6 flex flex-row items-center">
        <div className="flex items-center gap-4">
          <Skeleton isLoaded={tokenName !== undefined} className="flex rounded-full w-10 h-10">
            <Avatar
              size="md"
              radius="full"
              src={imgSrc}
              name={tokenName}
            />
          </Skeleton>
          <Skeleton isLoaded={tokenName !== undefined} className={clsx(tokenName === undefined && ['rounded-lg', 'w-[100px]', 'max-h-[1.5em]'])}>
            <span className="font-bold">
              {tokenName}
            </span>
          </Skeleton>
        </div>

        <div className="ml-auto grid grid-cols-3 gap-8">
          <div className="flex flex-col justify-center items-end" style={{ minWidth: '100px' }}>
            <span className="text-right text-xs text-[#888888]">
              Funded
            </span>
            <Skeleton isLoaded={tokenName !== undefined} className={clsx(tokenName === undefined && ['rounded-lg', 'w-[80px]', 'min-h-[1em]', 'mt-1'])}>
              <span className="text-right text-bold">{`${fundedTimes} times`}</span>
            </Skeleton>
          </div>
          <div className="flex flex-col justify-center items-end" style={{ minWidth: '100px' }}>
            <span className="text-right text-xs text-[#888888]">
              Distributed
            </span>
            <Skeleton isLoaded={formattedFunded !== undefined} className={clsx(formattedFunded === undefined && ['rounded-lg', 'w-[80px]', 'min-h-[1em]', 'mt-1'])}>
              <span className="text-right text-bold">
                {formattedFunded !== undefined ? (
                  `${formattedFunded} ${tokenSymbol}`
                ) : ' '}
              </span>
            </Skeleton>
          </div>
          <div className="flex flex-col justify-center items-end" style={{ minWidth: '100px' }}>
            <span className="text-right text-xs text-[#888888]">
              Withdrawn
            </span>
            <Skeleton isLoaded={formattedWithdrawn !== undefined} className={clsx(formattedWithdrawn === undefined && ['rounded-lg', 'w-[80px]', 'min-h-[1em]', 'mt-1'])}>
              <span className="text-right text-bold">
                {formattedWithdrawn !== undefined ? `${formattedWithdrawn} ${tokenSymbol}` : ' '}
              </span>
            </Skeleton>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

const SkeltonFundCard = () => {
  return (
    <Card>
      <CardBody className="py-4 px-6 flex flex-row items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="flex rounded-full w-10 h-10" />
          <Skeleton className={clsx('rounded-lg', 'w-[100px]', 'max-h-[1.5em]')} />
        </div>
        <div className="ml-auto grid grid-cols-3 gap-8">
          <div className="flex flex-col justify-center items-end" style={{ minWidth: '100px' }}>
            <span className="text-right text-xs text-[#888888]">
              Funded
            </span>
            <Skeleton className={clsx('rounded-lg', 'w-[80px]', 'min-h-[1em]', 'mt-1')} />
          </div>
          <div className="flex flex-col justify-center items-end" style={{ minWidth: '100px' }}>
            <span className="text-right text-xs text-[#888888]">
              Distributed
            </span>
            <Skeleton className={clsx('rounded-lg', 'w-[80px]', 'min-h-[1em]', 'mt-1')} />
          </div>
          <div className="flex flex-col justify-center items-end" style={{ minWidth: '100px' }}>
            <span className="text-right text-xs text-[#888888]">
              Withdrawn
            </span>
            <Skeleton className={clsx('rounded-lg', 'w-[80px]', 'min-h-[1em]', 'mt-1')} />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

type Props = {
  funds: RepositoryFund[];
  loading: boolean;
}

export const FundsInfo = ({ loading, funds }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="w-full text-left text-[#ECEDEE] text-[18px] font-bold">Funded</h2>
      <div className="grid grid-cols-2 gap-4">
        {funds.map((fund) => (
          <FundCard key={fund.tokenAddress} fund={fund} />
        ))}
        {loading && new Array(2).fill(null).map((_, index) => (
          <SkeltonFundCard key={index} />
        ))}
      </div>
    </div>
  )
}