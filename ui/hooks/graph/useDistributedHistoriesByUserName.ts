import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { uniqBy } from 'lodash';

const repositoriesQuery = gql`
  query RepositoriesQuery($githubLogin: String!) {
    userAccounts(name: $githubLogin) {
      name
      distributedHistories {
        id
        amount
        fundHistory {
          tokenAddress
          timestamp
          repository {
            name
            organization
          }
        }
      }
    }
  }
`;

type Result = {
  userAccounts: {
    name: string
    distributedHistories: {
      id: string;
      amount: string;
      fundHistory: {
        tokenAddress: string;
        timestamp: string;
        repository: {
          name: string;
          organization: string;
        }
      }
    }[];
  }[];
}

const extractData = (rawData: Result | undefined, githubLogin: string) => {
  if (!rawData) return undefined

  const userAccount = rawData.userAccounts.find((x) => x.name === githubLogin);
  if (!userAccount) return undefined;

  const histories = userAccount.distributedHistories.flatMap((history) => {
    return {
      id: history.id,
      organization: history.fundHistory.repository.organization,
      repository: history.fundHistory.repository.name,
      tokenAddress: history.fundHistory.tokenAddress,
      amount: history.amount,
      timestamp: Number.parseInt(history.fundHistory.timestamp),
    }
  });

  return histories;
}

export const useDistributedHistoriesByUserName = (githubLogin: string) => {
  const query = useQuery<Result>(repositoriesQuery, {
    variables: {
      githubLogin,
    }
  });

  return useMemo(() => {
    return {
      ...query,
      data: extractData(query.data, githubLogin),
    }
  }, [query.data, githubLogin])
}