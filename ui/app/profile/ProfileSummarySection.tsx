"use client";

import { useGitHubAccount } from "../../hooks/useGitHubAccount";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";

type Props = {
  iconSrc: string;
  profileUrl: string;
  name: string;
  bio: string;
  githubId: string;
  hasZKPass: boolean;
  onClickIssueZKPass: React.MouseEventHandler;
};

export const ProfileSummarySection = ({
  iconSrc,
  profileUrl,
  name,
  bio,
  githubId,
  hasZKPass,
  onClickIssueZKPass,
}: Props) => {
  const myProfile = useGitHubAccount();
  const router = useRouter();

  useEffect(() => {
    if (
      (myProfile.isFetched && myProfile.data === undefined) ||
      myProfile.isError
    ) {
      router.replace("/");
    }
  }, [myProfile, router]);

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader>
        <div
          style={{
            width: "100%",
            padding: "24px 32px",
            display: "flex",
          }}
        >
          <Avatar
            className="w-20 h-20 text-large"
            isBordered
            radius="full"
            showFallback={false}
            fallback={null}
            src={iconSrc}
          />

          <div
            style={{
              marginLeft: "24px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Basic Profile */}
            <div
              style={{
                height: "80px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
              }}
            >
              <span
                style={{
                  fontSize: "18px !important",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                {name}
              </span>
              <span
                style={{
                  marginTop: "8px",
                  fontSize: "16px !important",
                  fontWeight: "400",
                }}
              >
                {bio}
              </span>

              {/* Accounts */}
              <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <FaGithub size="24px" />
                  <p
                    style={{
                      textAlign: "left",
                      color: "#ECEDEE",
                      fontSize: "16px !important",
                      fontWeight: "400",
                      textDecoration: "underline",
                    }}
                  >
                    {githubId}
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div style={{ marginLeft: "auto" }}>
            {hasZKPass && (
              <Button
                color="success"
                variant="flat"
                startContent={<FaRegCheckCircle />}
                disabled={true}
              >
                ZKPass Issued
              </Button>
            )}
            {!hasZKPass && (
              <Button
                color="primary"
                variant="solid"
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
