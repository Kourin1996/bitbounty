"use client";

import { useGitHubAccount } from "../../../hooks/useGitHubAccount";
import { CircularProgress } from "@nextui-org/react";
import { Link, Button } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa6";
import TransgateConnect from "@zkpass/transgate-js-sdk";

export default function ZKPassIssuePage() {
  const myProfile = useGitHubAccount();
  const [isTransgateInstalled, setIsTransgateInstalled] = useState<
    boolean | null
  >(null);

  const connectorRef = useRef(
    new TransgateConnect(process.env.NEXT_PUBLIC_ZK_PASS_APP_ID!)
  );

  useEffect(() => {
    (async () => {
      setIsTransgateInstalled(
        await connectorRef.current.isTransgateAvailable()
      );
    })();
  }, []);

  const isLoadingGH = myProfile.isFetching;
  const isNotSignedInGitHub = myProfile.isFetched && !myProfile.data;
  const shouldInstallTransgate =
    myProfile.isFetched && myProfile.data && isTransgateInstalled === false;
  const canIssueZKPass =
    myProfile.isFetched && myProfile.data && isTransgateInstalled;

  return (
    <main
      className="flex min-h-screen"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isLoadingGH && <CircularProgress aria-label="Loading..." />}
      {isNotSignedInGitHub && (
        <Button
          size="lg"
          isLoading={myProfile.isLoading}
          href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`}
          as={Link}
          color="default"
          variant="solid"
          endContent={<FaGithub />}
          style={{ backgroundColor: "#2b3137" }}
          disabled={myProfile.isPaused || myProfile.isLoading}
        >
          Please SignIn GitHub
        </Button>
      )}
      {shouldInstallTransgate && (
        <Button
          size="lg"
          href="https://chromewebstore.google.com/detail/zkpass-transgate/afkoofjocpbclhnldmmaphappihehpma"
          as={Link}
          color="default"
          variant="solid"
          style={{ backgroundColor: "#2b3137" }}
        >
          Please Install zkPass Transgate
        </Button>
      )}
      {canIssueZKPass && <h2>Please click Start in ZKPass Transgate Dialog</h2>}
    </main>
  );
}
