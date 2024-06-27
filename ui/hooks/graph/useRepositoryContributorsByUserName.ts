import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

const repositoryContributorsQuery = gql`
  query RepositoryContributorsByUserNameQuery($githubName: String!) {
    repositoryContributors(where: {name: $githubName}) { 
        name
        tokenAddress
        distributed
        withdrawn
        repositoryID
        repository {
            id
            organization
            name
            numberFunded
        }
    }
  }
`;

type RepositoryContributor = {
  id: string;
  name: string;
  tokenAddress: string;
  distributed: string;
  withdrawn: string;
  repositoryID: string;

  repository: {
    id: string
    organization: string
    name: string
    numberFunded: string;
  }
}

type QueryResult = {
  repositoryContributors: RepositoryContributor[];
}

type UserRepository = {
  repositoryId: string;
  organization: string;
  repository: string;
  fundTimes: string;
  tokens: {
    address: string;
    distributed: string;
    withdrawn: string;
  }[]
}

export const useGraphRepositoryContributorsByUserName = (githubName: string) => {
  const query = useQuery<QueryResult>(repositoryContributorsQuery, {
    variables: {
      githubName,
    }
  });

  return useMemo(() => {
    const mp: Record<string, UserRepository> = {};
    (query.data?.repositoryContributors ?? []).forEach((x) => {
      if (!(x.repositoryID in mp)) {
        mp[x.repositoryID] = {
          repositoryId: x.repositoryID,
          organization: x.repository.organization,
          repository: x.repository.name,
          fundTimes: x.repository.numberFunded,
          tokens: [],
        }
      }

      mp[x.repositoryID].tokens.push({
        address: x.tokenAddress,
        distributed: x.distributed,
        withdrawn: x.withdrawn,
      });
    });

    return {
      ...query,
      data: query.data !== undefined ? Object.values(mp) : undefined,
    }
  }, [query.data])
}