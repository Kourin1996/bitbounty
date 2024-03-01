"use client";

import { useSearchParams } from "next/navigation";
import { useGitHubRepository } from "../../hooks/useGitHubRepository";
import { Avatar, Button, Card, CardBody } from "@nextui-org/react";
import { Listbox, ListboxItem, ListboxSection, cn } from "@nextui-org/react";
import { useGitHubContributors } from "../../hooks/useGitHubContributors";
import Link from "next/link";

export default function Home() {
  const params = useSearchParams();
  const orgAndName = params.get("name");
  const query = useGitHubRepository(orgAndName!);
  const contributorsQuery = useGitHubContributors(orgAndName!);

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

      <div
        style={{
          marginTop: "48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}
      >
        <div>
          <h2 style={{ marginBottom: "12px", fontWeight: "600" }}>
            Contributors
          </h2>
          <Card style={{ width: "100%" }}>
            <CardBody>
              <Listbox>
                {contributorsQuery.data !== null &&
                  contributorsQuery.data !== undefined &&
                  contributorsQuery.data.map((x) => (
                    <ListboxItem showDivider key="new">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 24,
                          }}
                        >
                          <Avatar
                            size="sm"
                            isBordered
                            radius="full"
                            showFallback={false}
                            fallback={null}
                            src={x.avatar_url}
                          />
                          <span>{x.login}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{ textAlign: "right", fontSize: "12px" }}
                          >
                            {x.contributions} Contributions
                          </span>
                          <span
                            style={{ textAlign: "right", fontSize: "12px" }}
                          >
                            {/* TODO: fixed value */}
                            1000 USD Received
                          </span>
                        </div>
                      </div>
                    </ListboxItem>
                  ))}
              </Listbox>
            </CardBody>
          </Card>
        </div>

        <div>
          <h2 style={{ marginBottom: "12px", fontWeight: "600" }}>
            Supporters
          </h2>
          <Card style={{ width: "100%", padding: "8px 12px" }}>
            <CardBody>
              <Listbox>
                {contributorsQuery.data !== null &&
                  contributorsQuery.data !== undefined &&
                  contributorsQuery.data.map((x) => (
                    <ListboxItem showDivider key="new">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 24,
                          }}
                        >
                          <span>0xaaaaaaaa...</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{ textAlign: "right", fontSize: "12px" }}
                          >
                            {/* TODO: fixed value */}
                            1000 USD Funded
                          </span>
                        </div>
                      </div>
                    </ListboxItem>
                  ))}
              </Listbox>
            </CardBody>
          </Card>
        </div>
      </div>
    </main>
  );
}
