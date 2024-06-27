"use client";

import clsx from 'clsx';
import { Avatar, Button, Card, CardHeader, Chip, Skeleton } from "@nextui-org/react";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import { GitHubProfile } from "@hooks/useGitHubAccount";

type Props = {
  profile?: GitHubProfile;
  isMyProfile: boolean;
  hasZKPass: boolean;
  canIssueZKPass: boolean;
  issuingZKPass: boolean;
  onClickIssueZKPass: React.MouseEventHandler;
};

export const ProfileSummarySection = ({
  profile,
  isMyProfile,
  hasZKPass,
  canIssueZKPass,
  issuingZKPass,
  onClickIssueZKPass,
}: Props) => {
  const iconSrc = profile?.avatar_url;
  const name = profile?.name;
  const bio = profile?.bio;
  const githubLogin = profile?.login;
  const githubProfileUrl = profile?.html_url

  return (
    <Card className="w-full py-8 px-12">
      <CardHeader className='p-0'>
        <div className="w-full flex">
          <Skeleton isLoaded={profile !== iconSrc} className="flex rounded-full w-24 h-24">
            <Avatar
              className="w-24 h-24"
              radius="full"
              showFallback={false}
              fallback={null}
              src={iconSrc}
            />
          </Skeleton>

          <div className="ml-6 flex flex-col justify-around gap-y-2">
            <Skeleton isLoaded={name !== undefined} className={clsx('rounded-lg', 'min-h-[1.5em]', name === undefined && 'w-28')} >
              <div className="flex gap-3 items-center">
                <span className="text-base font-extrabold">
                  {name}
                </span>
                {hasZKPass && (
                  <Chip
                    className="px-2"
                    color="success"
                    variant="flat"
                    startContent={<FaRegCheckCircle />}
                  >
                    ZKPass Issued
                  </Chip>
                )}
              </div>
            </Skeleton>
            <Skeleton isLoaded={bio !== undefined} className={clsx('rounded-lg', 'min-h-[1.5em]', bio === undefined && 'w-60')} >
              <span className="text-base">
                {bio}
              </span>
            </Skeleton>
            <Skeleton isLoaded={githubLogin !== undefined} className={clsx('rounded-lg', 'min-h-[1.5em]', bio === undefined && 'w-28')} >
              <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                <FaGithub size="24px" />
                <p className="text-left text-[#ECEDEE] text-base font-normal underline">
                  {githubLogin}
                </p>
              </a>
            </Skeleton>
          </div>
          <div className='ml-auto'>
            {canIssueZKPass && (
              <Button
                color="primary"
                variant="solid"
                isLoading={issuingZKPass}
                onClick={onClickIssueZKPass}
              >
                Issue ZKPass
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
