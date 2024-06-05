"use client";

import { useSearchParams } from "next/navigation";
import { useGitHubRepository } from "../../hooks/useGitHubRepository";
import { Avatar, Button, Card, CardBody } from "@nextui-org/react";
import { Listbox, ListboxItem, ListboxSection, cn } from "@nextui-org/react";
import { useGitHubContributors } from "../../hooks/useGitHubContributors";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { ethers } from "ethers";

const funded = gql`
  query Funded {
    fundeds {
      id
      fundId
      orgAndName
      funder
      token
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

const distributeds = gql`
  query Funded {
    fundDistributeds {
      id
      fundId
      logins
      shares
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

const formatFixedPoints = (s: string) => {
  if (s.includes(".")) {
    const dotPos = s.indexOf(".");
    return s.slice(0, Math.min(s.length, dotPos + 3));
  } else {
    return s;
  }
};

export default function Home() {
  const params = useSearchParams();
  const orgAndName = params.get("name");
  const query = useGitHubRepository(orgAndName!);
  const contributorsQuery = useGitHubContributors(orgAndName!);

  const fundedQuery = useQuery(funded);
  const distributedsQuery = useQuery(distributeds);

  const contributors = useMemo(() => {
    const map: { [key: string]: bigint } = {};

    const fundedIds = (fundedQuery?.data?.fundeds ?? [])
      .filter((x: any) => x.orgAndName === orgAndName)
      .map((x: any) => x.fundId);

    (distributedsQuery?.data?.fundDistributeds ?? [])
      .filter((x: any) => fundedIds.includes(x.fundId))
      .forEach((x: any) => {
        for (let i = 0; i < x.logins.length; i++) {
          if (x.logins[i] in map) {
            map[x.logins[i]] = map[x.logins[i]] + BigInt(x.shares[i]);
          } else {
            map[x.logins[i]] = BigInt(x.shares[i]);
          }
        }
      });

    return map;
  }, [
    distributedsQuery?.data?.fundDistributeds,
    fundedQuery?.data?.fundeds,
    orgAndName,
  ]);

  const sum = (contributorsQuery.data ?? []).reduce(
    (acc: number, x: any) => acc + x.contributions,
    0
  );

  return (
    <main
      className="flex min-h-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "0px 64px",
      }}
    >
      <div
        style={{
          marginTop: "64px",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Avatar
          size="lg"
          isBordered
          radius="full"
          showFallback={false}
          fallback={null}
          src={query.data?.avatar}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1
            style={{
              textAlign: "left",
              color: "#ECEDEE",
              fontSize: "24px !important",
              fontWeight: "700",
            }}
          >
            {orgAndName}
          </h1>
          <p
            style={{
              textAlign: "left",
              color: "#ECEDEE",
              fontSize: "16px !important",
              fontWeight: "400",
            }}
          >
            {query.data?.description}
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Link href={`/support?name=${orgAndName}`}>
            <Button
              color="default"
              style={{
                color: "rgb(236, 237, 238)",
              }}
            >
              Support
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
