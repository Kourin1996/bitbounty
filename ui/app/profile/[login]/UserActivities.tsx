"use client";

import { Avatar, Card, Skeleton, Tooltip } from "@nextui-org/react";
import { useGitHubRepository } from "@hooks/useGitHubRepository";
import clsx from "clsx";
import { useMemo } from "react";
import { useERC20Metadata } from "@hooks/useERC20Metadata";
import formatUnitsWithFixedDecimalPoints from "@utils/format";

const ActivityCard = ({ activity }: { activity: Activity }) => {
  const repo = useGitHubRepository(`${activity.organization}/${activity.repository}`);
  const erc20Metadata = useERC20Metadata(activity.token_address);

  const text = useMemo(() => {
    if (!erc20Metadata.data) return undefined;

    const amount = formatUnitsWithFixedDecimalPoints(activity.token_amount, erc20Metadata.data.decimals!, 2);
    const symbol = erc20Metadata.data?.symbol;

    switch (activity.type) {
      case "distributed":
        return `${amount} ${symbol} Distributed`
      case "withdraw":
        return `${amount} ${symbol} Withdrawn`
      default:
        return "Unknown"
    }
  }, [activity.type, activity.token_amount, erc20Metadata.data]);

  const tokenAddress = activity.token_address.substring(0, 6) + "..." + activity.token_address.substring(activity.token_address.length - 6);

  const isLoaded = repo.isFetched && erc20Metadata.isFetched;

  return (
    <Card isHoverable className="py-4 px-6 w-full flex flex-row gap-6 items-center">
      <Skeleton isLoaded={isLoaded} className="flex rounded-full w-12 h-12">
        <Avatar
          className="w-12 h-12"
          radius="full"
          showFallback={false}
          fallback={null}
          src={repo.data?.avatar}
        />
      </Skeleton>
      <div className="flex flex-col justify-center gap-2">
        <Skeleton isLoaded={isLoaded} className={clsx(!isLoaded && ['h-3', 'w-20', 'rounded-lg'])}>
          <span className="ml-auto text-sm">{repo.data?.name}</span>
        </Skeleton>
        <Skeleton isLoaded={isLoaded} className={clsx(!isLoaded && ['h-3', 'w-60', 'rounded-lg'])}>
          <span className="text-sm font-extrabold">
            {text}
          </span>
        </Skeleton>
      </div>
      <div className="ml-auto flex flex-col justify-center gap-2 items-end">
        <Skeleton isLoaded={isLoaded} className={clsx(!isLoaded && ['h-3', 'w-20', 'rounded-lg'])}>
          <span className="ml-auto text-sm">{activity.date}</span>
        </Skeleton>
        <Skeleton isLoaded={isLoaded} className={clsx(!isLoaded && ['h-3', 'w-20', 'rounded-lg'])}>
          <Tooltip content={activity.token_address}>
            <span className="ml-auto text-sm cursor-pointer underline">{tokenAddress}</span>
          </Tooltip>
        </Skeleton>
      </div>
    </Card>
  )
}

export type Activity = {
  id: string
  organization: string;
  repository: string;
  type: 'withdraw' | 'distributed'
  token_address: string;
  token_amount: string;
  date: string
}

type Props = {
  activities: Activity[];
}

export const UserActivities = (props: Props) => {
  const activities = props.activities;

  return (
    <div className="flex flex-col">
      <h2 className="w-full text-left text-[#ECEDEE] text-[18px] font-bold">
        Activities
      </h2>
      <div className="w-full flex flex-col mt-4 gap-4">
        {activities.map((activity) => {
          return (
            <ActivityCard key={activity.id} activity={activity} />
          )
        })}
      </div>
    </div>
  );
};
