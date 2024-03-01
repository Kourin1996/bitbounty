"use client";

import { useSearchParams } from "next/navigation";
import { Avatar, Button, Card, Divider, Input } from "@nextui-org/react";
import { useGitHubContributors } from "../../hooks/useGitHubContributors";
import { Select, SelectItem } from "@nextui-org/react";
import { useMemo, useState } from "react";

// ETH: https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png
// USDT: https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png
// EURC: https://tokens.1inch.io/0x1abaea1f7c830bd89acc67ec4af516284b1bc33c.png

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
  const params = useSearchParams();
  const orgAndName = params.get("name");
  const contributorsQuery = useGitHubContributors(orgAndName!);

  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);

  const totals = useMemo(
    () =>
      contributorsQuery.data
        ? contributorsQuery.data.reduce((acc, x) => acc + x.contributions, 0)
        : null,
    [contributorsQuery.data]
  );

  const contributors = useMemo(() => {
    return (contributorsQuery.data ?? []).map((x) => ({
      ...x,
      share:
        amount && totals
          ? (Number.parseInt(amount) * x.contributions) / totals
          : null,
    }));
  }, [contributorsQuery.data, amount, totals]);

  const tokenLabel = useMemo(
    () => tokens.find((t) => t.id === token)?.label,
    [token]
  );

  console.log({ amount, token, totals });

  return (
    <main
      className="flex min-h-screen"
      style={{
        padding: "64px 64px 32px",
        maxHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "max-content max-content 1fr max-content",
        gap: "32px",
      }}
    >
      <h1
        style={{
          textAlign: "left",
          color: "#ECEDEE",
          fontSize: "24px !important",
          fontWeight: "700",
        }}
      >
        Support for {orgAndName}
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        <Input
          type="number"
          variant="bordered"
          label="Amount"
          labelPlacement="inside"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
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
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h2
          style={{
            textAlign: "left",
            color: "#ECEDEE",
            fontSize: "24px !important",
            fontWeight: "600",
            flex: "0 0",
          }}
        >
          Preview
        </h2>
        <div
          style={{
            marginTop: "12px",
            overflow: "auto",
            maxHeight: "calc(100vh - 340px)",
          }}
        >
          <Card>
            {contributors.map((c) => (
              <>
                <div
                  style={{
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0px 24px",
                  }}
                >
                  <Avatar
                    size="sm"
                    isBordered
                    radius="full"
                    showFallback={false}
                    fallback={null}
                    src={c.avatar_url}
                  />
                  <span
                    style={{
                      marginLeft: "16px",
                      fontSize: "24px",
                      fontWeight: "600",
                    }}
                  >
                    {c.login}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "24px",
                      fontWeight: "600",
                    }}
                  >
                    {c.share !== null &&
                      tokenLabel !== undefined &&
                      `${c.share} ${tokenLabel}`}
                  </span>
                </div>

                <Divider />
              </>
            ))}
          </Card>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button color="primary">Support</Button>
      </div>
    </main>
  );
}
