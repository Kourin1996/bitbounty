"use client";

import { useSearchParams } from "next/navigation";
import { useGitHubAccount } from "../../hooks/useGitHubAccount";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Select, SelectItem } from "@nextui-org/react";

const chains = [
  {
    id: "sepolia",
    label: "Ethereum Sepolia",
    image: "https://docs.chain.link/assets/chains/ethereum.svg",
  },
  {
    id: "base_sepolia",
    label: "Base Sepolia",
    image: "https://docs.chain.link/assets/chains/base.svg",
  },
];

const tokens = [
  {
    id: "ETH",
    label: "ETH",
    image:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
  },
  {
    id: "USDC",
    label: "USDC",
    image:
      "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
  },
  {
    id: "EURC",
    label: "EURC",
    image:
      "https://tokens.1inch.io/0x1abaea1f7c830bd89acc67ec4af516284b1bc33c.png",
  },
];

export default function Home() {
  const myProfile = useGitHubAccount();
  const router = useRouter();

  const [chain, setChain] = useState<string | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (
      (myProfile.isFetched && myProfile.data === undefined) ||
      myProfile.isError
    ) {
      router.replace("/");
    }
  }, [myProfile, router]);

  return (
    <main
      className="flex min-h-screen"
      style={{
        padding: "64px 64px 24px",
        maxHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "max-content max-content 1fr max-content",
        gap: "24px",
      }}
    >
      <h1
        style={{
          textAlign: "left",
          color: "#ECEDEE",
          fontSize: "24px !important",
          fontWeight: "600",
        }}
      >
        Profile
      </h1>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Avatar
          className="w-20 h-20 text-large"
          isBordered
          radius="full"
          showFallback={false}
          fallback={null}
          src={myProfile?.data?.avatar_url}
        />
        <div
          style={{
            height: "80px",
            marginLeft: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ fontSize: "18px !important", fontWeight: "800" }}>
            {myProfile?.data?.name}
          </span>
          <span style={{ fontSize: "16px !important", fontWeight: "600" }}>
            {myProfile?.data?.bio}
          </span>
          <a
            href={myProfile?.data?.html_url}
            style={{
              width: "auto",
              fontSize: "12px !important",
              textDecoration: "underline #ECEDEE",
              cursor: "pointer",
            }}
          >
            {myProfile?.data?.html_url}
          </a>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Button color="default" variant="bordered">
            Issue ZKPass
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "36px" }}>
        <span style={{ fontSize: "24px !important", fontWeight: "600" }}>
          Recipient Info
        </span>
        <div
          style={{
            marginTop: "12px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: 24,
          }}
        >
          <Select
            label="Select a chain"
            variant="bordered"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          >
            {chains.map((t) => (
              <SelectItem
                key={t.id}
                value={t.id}
                startContent={
                  <Avatar
                    size="sm"
                    isBordered
                    radius="full"
                    showFallback={false}
                    fallback={null}
                    src={t.image}
                  />
                }
              >
                {t.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Select a token"
            variant="bordered"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          >
            {tokens.map((t) => (
              <SelectItem
                key={t.id}
                value={t.id}
                startContent={
                  <Avatar
                    size="sm"
                    isBordered
                    radius="full"
                    showFallback={false}
                    fallback={null}
                    src={t.image}
                  />
                }
              >
                {t.label}
              </SelectItem>
            ))}
          </Select>
          <Button color="default" style={{ height: "100%" }}>
            Update
          </Button>
        </div>

        <div style={{ marginTop: "36px" }}>
          <span style={{ fontSize: "24px !important", fontWeight: "600" }}>
            Receipts
          </span>
        </div>
      </div>
    </main>
  );
}
