"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGitHubAccount, useGithubProfile } from "@hooks/useGitHubAccount";
import { useIssueZKPass } from "@hooks/useIssueZKPass";
import { ProfileSummarySection } from "./ProfileSummarySection";
import { Activity, UserActivities } from "./UserActivities";
import { UserContributions } from "./UserContributions";
import { Header } from "@components/Header";
import { useReadContract } from "wagmi";
import GitHubFundManagerABI from "@constants/GitHubFundManager.json";
import { useGraphRepositoryContributorsByUserName } from "@hooks/graph/useRepositoryContributorsByUserName";
import { Card, CardHeader } from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { useWithdrawHistoriesByUserName } from "@hooks/graph/useWithdrawHistoriesByUserName";
import { orderBy } from 'lodash';
import { useDistributedHistoriesByUserName } from "@hooks/graph/useDistributedHistoriesByUserName";

export default function Home({ params }: { params: { login: string } }) {
  const { login } = params;
  const myProfile = useGitHubAccount();
  const profile = useGithubProfile(login);
  const router = useRouter();
  const issueZKPass = useIssueZKPass(login);

  const [isIssuing, setIsIssuing] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  useEffect(() => {
    if (!login) {
      router.replace("/");
    }
  }, [myProfile, router]);

  const isGitHubAccountRegistered = useReadContract({
    abi: GitHubFundManagerABI,
    address: process.env.NEXT_PUBLIC_GITHUB_FUND_MANAGER! as `0x${string}`,
    functionName: 'isGitHubAccountRegistered',
    args: [login],
  });

  const onClickIssueZKPass = useCallback(
    async (e: React.MouseEvent) => {
      setIsIssuing(true);
      const ok = await issueZKPass();
      setIsIssuing(false);
      if (ok) {
        setIsMessageDialogOpen(true);
        isGitHubAccountRegistered.refetch();
        setTimeout(() => setIsMessageDialogOpen(false), 5000);
      }
    },
    [isGitHubAccountRegistered, issueZKPass]
  );

  const userRepositoriesQuery = useGraphRepositoryContributorsByUserName(login);
  const contributions = userRepositoriesQuery.data;

  const distributedHistoriesQuery = useDistributedHistoriesByUserName(login);
  const withdrawHistoriesQuery = useWithdrawHistoriesByUserName(login);

  const distributedHistories = useMemo(() => {
    return (distributedHistoriesQuery.data ?? []).map((x) => ({
      id: x.id,
      organization: x.organization,
      repository: x.repository,
      type: 'distributed' as 'distributed',
      token_address: x.tokenAddress,
      token_amount: x.amount,
      date: new Date(x.timestamp * 1000).toLocaleDateString(),
      timestamp: x.timestamp,
    }));
  }, [distributedHistoriesQuery.data]);

  const withdrawHistories = useMemo(() => {
    return (withdrawHistoriesQuery.data ?? []).map((x) => ({
      id: x.id,
      organization: x.organization,
      repository: x.repository,
      type: 'withdraw' as 'withdraw',
      token_address: x.tokenAddress,
      token_amount: x.amount,
      date: new Date(x.timestamp * 1000).toLocaleDateString(),
      timestamp: x.timestamp,
    }));
  }, [withdrawHistoriesQuery.data]);

  const activities: Activity[] = useMemo(() => orderBy(
    [...distributedHistories, ...withdrawHistories],
    ['timestamp'], ['desc']
  ), [distributedHistories, withdrawHistories]);

  const isMyProfile = login === myProfile?.data?.login;
  const hasZKPass = isGitHubAccountRegistered.data === true;
  const canIssuePass = isMyProfile && isGitHubAccountRegistered.data === false;

  return (
    <main className="flex flex-col min-h-screen pt-8 px-16 gap-y-12">
      <div style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
        <Header showsGitHubButton={false} />
      </div>
      <div style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
        <ProfileSummarySection
          profile={profile?.data}
          isMyProfile={isMyProfile}
          hasZKPass={hasZKPass}
          canIssueZKPass={canIssuePass}
          issuingZKPass={isIssuing}
          onClickIssueZKPass={onClickIssueZKPass}
        />
      </div>
      <div className="flex gap-x-8">
        <div className="w-1/2">
          <UserActivities activities={activities} />
        </div>
        <div className="w-1/2">
          <UserContributions loading={userRepositoriesQuery.loading} userLogin={login} contributions={contributions ?? []} isWithdrawable={hasZKPass} onRefetch={() => userRepositoriesQuery.refetch()} />
        </div>
      </div>

      {isMessageDialogOpen && (
        <div className="fixed bottom-4 right-4">
          <Card shadow="lg">
            <CardHeader className="flex gap-4 px-6 py-4">
              <span className="text-sm">
                GitHub Account has been registered!
              </span>
              <div className="flex justify-end cursor-pointer" onClick={() => setIsMessageDialogOpen(false)}>
                <IoClose />
              </div>
            </CardHeader>
          </Card>
        </div>
      )}
    </main>
  );
}
