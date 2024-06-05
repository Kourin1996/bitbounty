import { useQuery } from "@tanstack/react-query";

import { useGitHubAccessToken } from "./useGitHubAccessToken";

// TODO: fix this
function buildQuery(githubId: string) {
  return `query {
    user(login: "${githubId}") {
      name
      commitContributionsByRepository {

      }

      contributionsCollection {
        contributionCalendar {
          colors
          totalContributions
          weeks {
            contributionDays {
              color
              contributionCount
              date
              weekday
            }
            firstDay
          }
        }
      }
    }
  }`;
}

export const useGitHubAccountContributions = (githubId: string) => {
  const accessToken = useGitHubAccessToken();

  return useQuery<any>({
    queryKey: ["GitHub/AccountContributions", accessToken, githubId],
    enabled: accessToken !== null,
    queryFn: async () => {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: buildQuery(githubId),
        }),
      });

      return res.json();
    },
  });
};
