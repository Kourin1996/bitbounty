"use client";

import { Header } from "@components/Header";
import { RepositoryInfo } from "./RepositoryInfo";
import { FundsInfo } from "./FundsInfo";
import { ContributorsInfo } from "./ContributorsInfo";
import { useGraphRepositoryFunds } from "@hooks/graph/useRepositoryFunds";
import { useGraphRepositoryByName } from "@hooks/graph/useRepositoryByName";

export default function Home({ params }: { params: { org: string; repo: string } }) {
  const { org, repo } = params;

  const orgAndName = `${org}/${repo}`
  const repositoryQuery = useGraphRepositoryByName(org, repo);
  const repositoryFunds = useGraphRepositoryFunds(orgAndName);

  const repositoryId = repositoryQuery.data?.id;
  const tokenAddresses = (repositoryFunds.data?.repositoryFunds ?? []).map((x) => x.tokenAddress);

  return (
    <main className="flex flex-col min-h-screen pt-8 px-16 gap-y-12 pb-16">
      <Header showsGitHubButton />
      <RepositoryInfo organization={org} repository={repo} />
      <FundsInfo loading={repositoryFunds.loading} funds={repositoryFunds.data?.repositoryFunds ?? []} />
      <ContributorsInfo organization={org} repository={repo} repositoryId={repositoryId} tokenAddresses={tokenAddresses} />
    </main>
  );
}
