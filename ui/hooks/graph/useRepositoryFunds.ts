import { gql, useQuery } from "@apollo/client";

const repositoryFundsQuery = gql`
  query RepositoryFundsQuery($orgAndName: String!) {
    repositoryFunds(where: { organizationAndRepository: $orgAndName }) {
        id
        organizationAndRepository
        tokenAddress
        fundedTimes
        funded
        withdrawn
    }
  }
`;

export type RepositoryFund = {
  id: string;
  organizationAndRepository: string;
  tokenAddress: string;
  fundedTimes: string;
  funded: string;
  withdrawn: string;
}

type Result = {
  repositoryFunds: RepositoryFund[];
}

export const useGraphRepositoryFunds = (orgAndName: string) => {
  return useQuery<Result>(repositoryFundsQuery, {
    variables: {
      orgAndName,
    }
  });
}
