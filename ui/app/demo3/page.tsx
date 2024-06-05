"use client";

import {
  Avatar,
  Card,
  CardBody,
  Chip,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { FaGithub } from "react-icons/fa";

export default function Home() {
  return (
    <main
      className="flex min-h-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "100px 128px",
      }}
    >
      <div>
        <Card>
          <CardBody style={{ padding: "24px 32px" }}>
            <div
              style={{
                display: "flex",
                gap: 24,
              }}
            >
              <Avatar
                size="lg"
                isBordered
                radius="full"
                showFallback={false}
                fallback={null}
                src={"/kourin.jpg"}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <h1
                    style={{
                      textAlign: "left",
                      color: "#ECEDEE",
                      fontSize: "24px !important",
                      fontWeight: "700",
                    }}
                  >
                    Kourin1996
                  </h1>
                  <Chip color="success">ZKPass Issued</Chip>
                </div>

                <p
                  style={{
                    textAlign: "left",
                    color: "#ECEDEE",
                    fontSize: "16px !important",
                    fontWeight: "400",
                  }}
                >
                  Visionary Blockchain Engineer | 7+ Years in Optimizing
                  Blockchain Systems
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
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
                    Kourin1996
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <img
                    alt="eth"
                    src="/eth.png"
                    style={{ width: 24, height: 24 }}
                  />
                  <p
                    style={{
                      textAlign: "left",
                      color: "#ECEDEE",
                      fontSize: "16px !important",
                      fontWeight: "400",
                      textDecoration: "underline",
                    }}
                  >
                    0x68E7BD8736DeD1dF80cBe5FD74a50e904F6C6f3F
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            marginTop: 32,
          }}
        >
          <div>
            <Card>
              <CardBody style={{ padding: "24px 16px" }}>
                <h1
                  style={{
                    marginLeft: 16,
                    textAlign: "left",
                    color: "#ECEDEE",
                    fontSize: "32px !important",
                    fontWeight: "700",
                  }}
                >
                  Activities
                </h1>

                <Listbox style={{ marginTop: 8 }}>
                  <ListboxItem key={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginLeft: 8,
                      }}
                    >
                      <Avatar
                        size="sm"
                        isBordered
                        radius="full"
                        showFallback={false}
                        fallback={null}
                        src={
                          "https://avatars.githubusercontent.com/u/528860?s=48&v=4"
                        }
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <h3
                          style={{
                            textAlign: "left",
                            color: "#ECEDEE",
                            fontSize: "24px !important",
                            fontWeight: "700",
                          }}
                        >
                          Closed Issue #1000
                        </h3>
                        <p>bitcoin / bitcoin</p>
                      </div>
                      <div
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <p
                            style={{
                              fontSize: "12px !important",
                              textAlign: "right",
                              color: "#999999",
                            }}
                          >
                            2024/05/10
                          </p>
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
                              style={{ width: 24, height: 24 }}
                            />
                            <p>0.0001 ETH</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ListboxItem>

                  <ListboxItem key={2} style={{ marginTop: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginLeft: 8,
                      }}
                    >
                      <Avatar
                        size="sm"
                        isBordered
                        radius="full"
                        showFallback={false}
                        fallback={null}
                        src={
                          "https://avatars.githubusercontent.com/u/43838009?s=48&v=4"
                        }
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <h3
                          style={{
                            textAlign: "left",
                            color: "#ECEDEE",
                            fontSize: "24px !important",
                            fontWeight: "700",
                          }}
                        >
                          Merged a PR #123
                        </h3>
                        <p>OffchainLabs / nitro</p>
                      </div>
                      <div
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <p
                            style={{
                              fontSize: "12px !important",
                              textAlign: "right",
                              color: "#999999",
                            }}
                          >
                            2024/04/01
                          </p>
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
                              style={{ width: 24, height: 24 }}
                            />
                            <p>100 DAI</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ListboxItem>
                </Listbox>
              </CardBody>
            </Card>
          </div>

          <div>
            <Card>
              <CardBody style={{ padding: "24px 16px" }}>
                <h1
                  style={{
                    marginLeft: 16,
                    textAlign: "left",
                    color: "#ECEDEE",
                    fontSize: "32px !important",
                    fontWeight: "700",
                  }}
                >
                  Contributed
                </h1>

                <Listbox style={{ marginTop: 8 }}>
                  <ListboxItem key={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginLeft: 8,
                      }}
                    >
                      <Avatar
                        size="sm"
                        isBordered
                        radius="full"
                        showFallback={false}
                        fallback={null}
                        src={
                          "https://avatars.githubusercontent.com/u/528860?s=48&v=4"
                        }
                        style={{ margin: "4px 0px" }}
                      />
                      <h3
                        style={{
                          textAlign: "left",
                          color: "#ECEDEE",
                          fontSize: "24px !important",
                          fontWeight: "700",
                        }}
                      >
                        bitcoin / bitcoin
                      </h3>

                      <p
                        style={{
                          marginLeft: "auto",
                          textAlign: "left",
                          color: "#ECEDEE",
                          fontSize: "24px !important",
                        }}
                      >
                        100 contributions
                      </p>
                    </div>
                  </ListboxItem>

                  <ListboxItem key={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginLeft: 8,
                      }}
                    >
                      <Avatar
                        size="sm"
                        isBordered
                        radius="full"
                        showFallback={false}
                        fallback={null}
                        src={
                          "https://avatars.githubusercontent.com/u/6250754?s=48&v=4"
                        }
                        style={{ margin: "4px 0px" }}
                      />
                      <h3
                        style={{
                          textAlign: "left",
                          color: "#ECEDEE",
                          fontSize: "24px !important",
                          fontWeight: "700",
                        }}
                      >
                        ethereum / go-ethereum
                      </h3>

                      <p
                        style={{
                          marginLeft: "auto",
                          textAlign: "left",
                          color: "#ECEDEE",
                          fontSize: "24px !important",
                        }}
                      >
                        55 contributions
                      </p>
                    </div>
                  </ListboxItem>

                  <ListboxItem key={1}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginLeft: 8,
                      }}
                    >
                      <Avatar
                        size="sm"
                        isBordered
                        radius="full"
                        showFallback={false}
                        fallback={null}
                        src={
                          "https://avatars.githubusercontent.com/u/43838009?s=48&v=4"
                        }
                        style={{ margin: "4px 0px" }}
                      />
                      <h3
                        style={{
                          textAlign: "left",
                          color: "#ECEDEE",
                          fontSize: "24px !important",
                          fontWeight: "700",
                        }}
                      >
                        OffchainLabs / nitro
                      </h3>

                      <p
                        style={{
                          marginLeft: "auto",
                          textAlign: "left",
                          color: "#ECEDEE",
                          fontSize: "24px !important",
                        }}
                      >
                        18 contributions
                      </p>
                    </div>
                  </ListboxItem>
                </Listbox>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
