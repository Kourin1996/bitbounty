"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GitHubConnectButton } from "@components/GitHubConnectButton";
import Link from "next/link";

type Props = {
  showsGitHubButton: boolean;
}

export function Header({ showsGitHubButton }: Props) {
  return (
    <div className="w-full flex justify-between">
      <Link href="/">
        <h1 className="text-[#ECEDEE] text-2xl font-bold">
          BitBounty
        </h1>
      </Link>
      <div className="flex gap-4">
        <ConnectButton />
        {showsGitHubButton && <GitHubConnectButton />}
      </div>
    </div>
  )
}