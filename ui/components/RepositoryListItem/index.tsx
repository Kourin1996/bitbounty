"use client";

import { Avatar, Card, CardBody, Skeleton } from "@nextui-org/react";
import { useGitHubRepository } from "../../hooks/useGitHubRepository";

type Props = {
  orgAndName: string;
  fundedCount?: string;
};

export const RepositoryListItem = ({ orgAndName, fundedCount }: Props) => {
  const repoQuery = useGitHubRepository(orgAndName);

  return (
    <Card className="w-full px-6 py-2 cursor-pointer">
      <CardBody>
        <div className="flex justify-between items-center">
          <div className="flex gap-6 items-center">

            <Avatar
              isBordered
              radius="full"
              showFallback={false}
              fallback={null}
              src={repoQuery.data?.avatar}
            />
            <h2 className="font-semibold text-lg">
              {orgAndName}
            </h2>
          </div>

          {fundedCount && (
            <span className="font-semibold">
              {fundedCount} Times Funded
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export const SkeltonRepositoryListItem = () => {
  return (
    <Card className="w-full px-6 py-2 cursor-pointer">
      <CardBody>
        <div className="flex justify-between items-center">
          <div className="flex gap-6 items-center">
            <Skeleton className="flex rounded-full w-10 h-10" />
            <Skeleton className="h-7 w-[250px] rounded-lg" />
          </div>
          <Skeleton className="h-7 w-[120px]  rounded-lg" />
        </div>
      </CardBody>
    </Card>
  );
};
