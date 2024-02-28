import { GitHubConnectButton } from "../components/GitHubConnectButton";
import { LifeCycle } from "./lifecycle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GitHubConnectButton />
      <LifeCycle />
    </main>
  );
}
