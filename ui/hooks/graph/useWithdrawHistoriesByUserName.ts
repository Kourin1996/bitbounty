import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

const withdrawHistoriesQuery = gql`
  query WithdrawHistoriesQuery($githubLogin: String!) {
    userAccounts(name: $githubLogin) {
      name
      withdrawHistories {
        id
        tokenAddress
        amount
        timestamp
        repository {
          name
          organization
        }
      }
    }
  }
`;

type Result = {
  userAccounts: {
    name: string
    withdrawHistories: {
      id: string
      tokenAddress: string
      amount: string
      timestamp: string
      repository: {
        name: string;
        organization: string;
      }
    }[];
  }[];
}

const extractData = (rawData: Result | undefined, githubLogin: string) => {
  if (!rawData) return undefined

  const userAccount = rawData.userAccounts.find((x) => x.name === githubLogin);
  if (!userAccount) return undefined;

  const histories = userAccount.withdrawHistories.map((history) => {
    return {
      id: history.id,
      organization: history.repository.organization,
      repository: history.repository.name,
      tokenAddress: history.tokenAddress,
      amount: history.amount,
      timestamp: Number.parseInt(history.timestamp),
    }
  });

  return histories;
}

export const useWithdrawHistoriesByUserName = (githubLogin: string) => {
  const query = useQuery<Result>(withdrawHistoriesQuery, {
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