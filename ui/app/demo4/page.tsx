"use client";

import { useSearchParams } from "next/navigation";
import { useGitHubRepository } from "../../hooks/useGitHubRepository";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  CircularProgress,
} from "@nextui-org/react";
import { Listbox, ListboxItem, ListboxSection, cn } from "@nextui-org/react";
import { useGitHubContributors } from "../../hooks/useGitHubContributors";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { ethers } from "ethers";

export default function Home() {
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
          src={"https://avatars.githubusercontent.com/u/6250754?s=48&v=4"}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1
            style={{
              textAlign: "left",
              color: "#ECEDEE",
              fontSize: "18px !important",
              fontWeight: "700",
            }}
          >
            ethereum / go-ethereum
          </h1>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Button>New Issue</Button>
        </div>
      </div>

      <Card style={{ marginTop: 32 }}>
        <CardBody
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: "18px 24px",
          }}
        >
          <h1
            style={{
              marginLeft: 18,
              textAlign: "left",
              color: "#ECEDEE",
              fontSize: "18px !important",
              fontWeight: "700",
            }}
          >
            Issues
          </h1>

          <Listbox>
            <ListboxItem
              key={1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
              }}
            >
              <div style={{ display: "flex" }}>
                <CircularProgress size="sm" value={100} color="success" />
                <div
                  style={{
                    marginLeft: 16,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      textAlign: "left",
                      color: "#ECEDEE",
                      fontSize: "14px !important",
                      fontWeight: "700",
                    }}
                  >
                    Improve the bitcoin.conf instructions in init.md doc
                  </h3>
                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px !important",
                        color: "#999999",
                      }}
                    >
                      #30153
                    </p>
                    <Chip size="sm">Document</Chip>
                    <Chip size="sm">Markdown</Chip>
                    <p
                      style={{
                        fontSize: "12px !important",
                        color: "#999999",
                      }}
                    >
                      Open
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <img
                      alt="eth"
                      src="/eth.png"
                      style={{ width: 32, height: 32 }}
                    />
                    <p>0.0001 ETH</p>
                  </div>
                  <Button>Apply</Button>
                </div>
              </div>
            </ListboxItem>

            <ListboxItem
              key={1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
              }}
            >
              <div style={{ display: "flex" }}>
                <CircularProgress size="sm" value={100} color="success" />
                <div
                  style={{
                    marginLeft: 16,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      textAlign: "left",
                      color: "#ECEDEE",
                      fontSize: "14px !important",
                      fontWeight: "700",
                    }}
                  >
                    LevelDB error: Corruption: block checksum mismatch didn't
                    trigger reindex.
                  </h3>
                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px !important",
                        color: "#999999",
                      }}
                    >
                      #30138
                    </p>
                    <Chip size="sm">Bug</Chip>
                    <Chip size="sm">Protocol</Chip>
                    <p
                      style={{
                        fontSize: "12px !important",
                        color: "#999999",
                      }}
                    >
                      Open
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <img
                      alt="dai"
                      src="/dai.png"
                      style={{ width: 32, height: 32 }}
                    />
                    <p>100 DAI</p>
                  </div>
                  <Button>Apply</Button>
                </div>
              </div>
            </ListboxItem>

            <ListboxItem
              key={1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
              }}
            >
              <div style={{ display: "flex" }}>
                <CircularProgress size="sm" value={100} color="warning" />
                <div
                  style={{
                    marginLeft: 16,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      textAlign: "left",
                      color: "#ECEDEE",
                      fontSize: "14px !important",
                      fontWeight: "700",
                    }}
                  >
                    upstream: GUIX closure contains too much unnecessary stuff
                  </h3>
                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px !important",
                        color: "#999999",
                      }}
                    >
                      #30042
                    </p>
                    <Chip size="sm">Build System</Chip>
                    <p
                      style={{
                        fontSize: "12px !important",
                        color: "#999999",
                      }}
                    >
                      Awaiting Review
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <img
                      alt="dai"
                      src="/dai.png"
                      style={{ width: 32, height: 32 }}
                    />
                    <p>200 DAI</p>
                  </div>
                  <Button>Apply</Button>
                </div>
              </div>
            </ListboxItem>

            <ListboxItem
              key={1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
              }}
            >
              <div style={{ display: "flex" }}>
                <CircularProgress size="sm" value={100} color="secondary" />
                <div
                  style={{
                    marginLeft: 16,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      textAlign: "left",
                      color: "#ECEDEE",
                      fontSize: "14px !important",
                      fontWeight: "700",
                    }}
                  >
                    Manually Banning Peers Results in Crash
                  </h3>
                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px !important",
                        color: "#999999",
                      }}
                    >
                      #29916
                    </p>
                    <Chip size="sm">Build System</Chip>
                    <p
                      style={{
                        fontSize: "12px !important",
                        color: "#999999",
                      }}
                    >
                      Completed
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <img
                      alt="usdc"
                      src="/usdc.png"
                      style={{ width: 32, height: 32 }}
                    />
                    <p>200 USDC</p>
                  </div>
                  <Button>View</Button>
                </div>
              </div>
            </ListboxItem>
          </Listbox>
        </CardBody>
      </Card>
    </main>
  );
}
