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

const Funded = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "400px",
        gap: 16,
      }}
    >
      <h2 style={{ fontWeight: "600" }}>Funded</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        <Card style={{ width: "100%" }}>
          <CardBody>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  alt="eth"
                  src="/eth.png"
                  style={{ width: "36px", borderRadius: "50%" }}
                />
                <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
                  ETH
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                  minWidth: "220px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", color: "#888888" }}>
                    Funded
                  </span>
                  <span style={{ fontWeight: "bold" }}>100 ETH</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", color: "#888888" }}>
                    Distributed
                  </span>
                  <span style={{ fontWeight: "bold" }}>90 ETH</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card style={{ width: "100%" }}>
          <CardBody>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  alt="dai"
                  src="/dai.png"
                  style={{ width: "36px", borderRadius: "50%" }}
                />
                <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
                  DAI
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                  minWidth: "220px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", color: "#888888" }}>
                    Funded
                  </span>
                  <span style={{ fontWeight: "bold" }}>5000 DAI</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", color: "#888888" }}>
                    Distributed
                  </span>
                  <span style={{ fontWeight: "bold" }}>5000 DAI</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card style={{ width: "100%" }}>
          <CardBody>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  alt="usdc"
                  src="/usdc.png"
                  style={{ width: "36px", borderRadius: "50%" }}
                />
                <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
                  USDC
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                  minWidth: "220px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", color: "#888888" }}>
                    Funded
                  </span>
                  <span style={{ fontWeight: "bold" }}>1000 USDC</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", color: "#888888" }}>
                    Distributed
                  </span>
                  <span style={{ fontWeight: "bold" }}>1000 USDC</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card style={{ width: "100%" }}>
          <CardBody>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  alt="shib"
                  src="/shib.png"
                  style={{ width: "36px", borderRadius: "50%" }}
                />
                <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
                  SHIB
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                  minWidth: "220px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", color: "#888888" }}>
                    Funded
                  </span>
                  <span style={{ fontWeight: "bold" }}>1000 SHIB</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", color: "#888888" }}>
                    Distributed
                  </span>
                  <span style={{ fontWeight: "bold" }}>1000 SHIB</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

const Contributors = ({ contributorsQuery, sum }: any) => {
  return (
    <div>
      <h2 style={{ marginBottom: "12px", fontWeight: "600" }}>Contributors</h2>
      <Card style={{ width: "100%" }}>
        <CardBody>
          <Listbox>
            {contributorsQuery.data !== null &&
              contributorsQuery.data !== undefined &&
              contributorsQuery.data.slice(0, 8).map((x: any) => (
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
                      <span style={{ textAlign: "right", fontSize: "12px" }}>
                        {x.contributions} Contributions
                      </span>
                      <span style={{ textAlign: "right", fontSize: "12px" }}>
                        {formatFixedPoints(`${110 * (x.contributions / sum)}`)}{" "}
                        Ether Distributed
                      </span>
                    </div>
                  </div>
                </ListboxItem>
              ))}
          </Listbox>
        </CardBody>
      </Card>
    </div>
  );
};

const Issues = () => {
  return (
    <div>
      <h2 style={{ marginBottom: "12px", fontWeight: "600" }}>Issues</h2>
      <Card>
        <CardBody
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: "18px 24px",
          }}
        >
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
    </div>
  );
};

const Summary = () => {
  return (
    <div>
      <h2 style={{ marginBottom: "12px", fontWeight: "600" }}>Summary</h2>
      <Card>
        <CardBody
          style={{
            gap: 64,
            padding: "24px 32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              width: "auto",
              height: "88px",
            }}
          >
            <span></span>
            <span
              style={{
                fontSize: "24px !important",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              100,000 USD
            </span>
            <span
              style={{
                fontSize: "12px !important",
                color: "#999999",
                textAlign: "center",
              }}
            >
              Funded
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              width: "auto",
              height: "88px",
            }}
          >
            <span></span>
            <span
              style={{
                fontSize: "24px !important",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              24
            </span>
            <span
              style={{
                fontSize: "12px !important",
                color: "#999999",
                textAlign: "center",
              }}
            >
              Contributors
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              width: "auto",
              height: "88px",
            }}
          >
            <span></span>
            <span
              style={{
                fontSize: "24px !important",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              123456
            </span>
            <span
              style={{
                fontSize: "12px !important",
                color: "#999999",
                textAlign: "center",
              }}
            >
              Total Contributions
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              width: "auto",
              height: "88px",
            }}
          >
            <span></span>
            <span
              style={{
                fontSize: "24px !important",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              4
            </span>
            <span
              style={{
                fontSize: "12px !important",
                color: "#999999",
                textAlign: "center",
              }}
            >
              Issues
            </span>
          </div>
          <div>
            <CircularProgress
              label="Distributed"
              classNames={{
                svg: "w-16 h-16 drop-shadow-md",
                indicator: "stroke-white",
                track: "stroke-white/10",
                value: "text-md font-semibold text-white",
              }}
              value={70}
              strokeWidth={4}
              showValueLabel={true}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

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
              Fund
            </Button>
          </Link>
        </div>
      </div>

      <div
        style={{
          marginTop: 64,
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: 32,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <Summary />
          <Issues />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <Funded />
          <Contributors contributorsQuery={contributorsQuery} sum={sum} />
        </div>
      </div>
    </main>
  );
}
