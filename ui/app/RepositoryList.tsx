"use client";

import { useGraphRepositories } from "@hooks/graph/useRepositories";
import { RepositoryListItem, SkeltonRepositoryListItem } from "../components/RepositoryListItem";
import Link from "next/link";

export const RepositoryList = () => {
  const query = useGraphRepositories();
  const repositories = query?.data?.repositories ?? [];

  return (
    <>
      {repositories.map((data) => (
        <Link key={`${data.organization}/${data.name}`} href={`/organizations/${data.organization}/repositories/${data.name}`} style={{ width: "100%" }}>
          <RepositoryListItem orgAndName={`${data.organization}/${data.name}`} fundedCount={data.numberFunded !== "0" ? data.numberFunded : undefined} />
        </Link>
      ))}
      {query.loading && new Array(5).fill(null).map((_, index) => (
        <SkeltonRepositoryListItem key={index} />
      ))}
    </>
  )
}