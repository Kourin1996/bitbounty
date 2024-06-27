import { gql, useQuery } from "@apollo/client";

const repositoriesQuery = gql`
  query RepositoriesQuery {
    repositories(first: 10, orderBy: numberFunded, orderDirection: desc) {
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

export const useGraphRepositories = () => {
  return useQuery<Result>(repositoriesQuery);
}