import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

const repositoryContributorsQuery = gql`
  query RepositoryContributorsQuery($repositoryID: String!, $githubName: String!) {
    repositoryContributors(where: { repositoryID: $repositoryID, name: $githubName }) {
      id
      name
      tokenAddress
      distributed
      withdrawn
      repositoryID
    }
  }
`;

export type RepositoryContributor = {
  id: string;
  name: string;
  tokenAddress: string;
  distributed: string;
  withdrawn: string;
  repositoryID: string;
}

type Result = {
  repositoryContributors: RepositoryContributor[];
}

export const useGraphRepositoryContributors = (repositoryID: string, githubName: string) => {
  const query = useQuery<Result>(repositoryContributorsQuery, {
    variables: {
      repositoryID,
      githubName,
    }
  });

  return useMemo(() => {
    return {
      ...query,
      data: query.data !== undefined ? query.data.repositoryContributors : undefined
    }
  }, [query.data])
}