import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

const repositoriesQuery = gql`
  query RepositoryByNameQuery($organization: String!, $name: String!) {
    repositories(where: {organization: $organization, name: $name}) {
      id
      index
      organization
      name
      numberFunded
    }
  }
`;

type Result = {
  repositories: {
    id: string;
    index: bigint;
    organization: string;
    name: string;
    numberFunded: string;
  }[];
}

export const useGraphRepositoryByName = (organization: string, name: string) => {
  const query = useQuery<Result>(repositoriesQuery, {
    variables: {
      organization,
      name
    }
  });

  return useMemo(() => {
    return {
      ...query,
      data: query.data !== undefined
        ? query.data.repositories.find((x) => x.organization === organization && x.name === name)
        : undefined
    }
  }, [query.data]);
}