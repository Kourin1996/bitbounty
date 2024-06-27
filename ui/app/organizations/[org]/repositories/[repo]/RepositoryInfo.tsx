"use client";

import { Avatar, Button, Skeleton } from "@nextui-org/react";
import { useGitHubRepository } from "@hooks/useGitHubRepository";
import Link from "next/link";
import clsx from "clsx";

type Props = {
  organization: string;
  repository: string;
}

export const RepositoryInfo = ({ organization, repository }: Props) => {
  const query = useGitHubRepository(`${organization}/${repository}`);

  return (
    <div className="flex items-center gap-6">
      {query.isLoading && <Skeleton isLoaded={query.isFetched} className={clsx('rounded-full', 'w-[56px]', 'h-[56px]')} />}
      {query.isFetched && (
        <Avatar
          size="lg"
          isBordered
          radius="full"
          showFallback={false}
          fallback={null}
          src={query.data?.avatar}
        />
      )}

      <div className="flex flex-col gap-3 justify-center">
        <h1 className="text-left text-[#ECEDEE] text-2xl font-bold">
          {`${organization}/${repository}`}
        </h1>
        <Skeleton isLoaded={query.isFetched} className={clsx(query.isLoading && ['rounded-lg', 'w-[350px]', 'min-h-[1.5em]'])}>
          <p className="text-left text-[#ECEDEE] text-base font-normal">
            {query.data?.description}
          </p>
        </Skeleton>
      </div>
      <div className="ml-auto">
        <Link href={`/organizations/${organization}/repositories/${repository}/fund`}>
          <Button color="default" style={{ backgroundColor: "#2b3137" }} isDisabled={query.isLoading}>
            Fund
          </Button>
        </Link>
      </div>
    </div>
  );
}