"use client";

import { useGitHubAccount } from "../../hooks/useGitHubAccount";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileSummarySection } from "./ProfileSummarySection";
import { useIssueZKPass } from "../../hooks/useIssueZKPass";
import { UserActivities } from "./UserActivities";
import { UserContributions } from "./UserContributions";

export default function Home() {
  const myProfile = useGitHubAccount();
  const router = useRouter();

  const issueZKPass = useIssueZKPass();

  useEffect(() => {
    if (
      (myProfile.isFetched && myProfile.data === undefined) ||
      myProfile.isError
    ) {
      router.replace("/");
    }
  }, [myProfile, router]);

  const onClickIssueZKPass = useCallback(
    (e: React.MouseEvent) => {
      issueZKPass();
    },
    [issueZKPass]
  );

  console.log("debug::GitHub profile", myProfile);

  return (
    <main
      className="flex min-h-screen"
      style={{
        padding: "64px 64px 24px",
        maxHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "max-content max-content",
        rowGap: "64px",
        columnGap: "24px",
      }}
    >
      {myProfile.isFetched && myProfile.data && (
        <div style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
          <ProfileSummarySection
            iconSrc={myProfile.data.avatar_url}
            profileUrl={myProfile.data.html_url}
            name={myProfile.data.name}
            bio={myProfile.data.bio}
            githubId={myProfile.data.login}
            hasZKPass={false}
            onClickIssueZKPass={onClickIssueZKPass}
          />
        </div>
      )}
      <UserActivities />
      <UserContributions />
    </main>
  );
}
