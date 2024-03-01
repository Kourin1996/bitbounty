"use client";

import { Avatar, Card, CardBody } from "@nextui-org/react";
import classes from "./index.module.css";
import { useGitHubRepository } from "../../hooks/useGitHubRepository";

type Props = {
  orgAndName: string;
};

export const RepositoryListItem = ({ orgAndName }: Props) => {
  const repoQuery = useGitHubRepository(orgAndName);
  const usdFunded = 1000;

  return (
    <Card
      className={classes.card}
      style={{ width: "100%", padding: "8px 24px", cursor: "pointer" }}
    >
      <CardBody>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Avatar
              isBordered
              radius="full"
              showFallback={false}
              fallback={null}
              src={repoQuery.data?.avatar}
            />
            <h2 style={{ fontWeight: "600", fontSize: "18px" }}>
              {orgAndName}
            </h2>
          </div>

          <span style={{ fontWeight: "700", fontSize: "18px" }}>
            {usdFunded} USD Funded
          </span>
        </div>
      </CardBody>
    </Card>
  );
};
