
import { Header } from "@components/Header";
import { NewRepositoryModal } from "./NewRepositoryModal";
import { RepositoryList } from "./RepositoryList";

const Title = () => {
  return (
    <div>
      <p
        style={{
          marginTop: "32px",
          textAlign: "center",
          color: "#ECEDEE",
          fontSize: "24px !important",
          fontWeight: "700",
        }}
      >
        Boost innovation with every bit
      </p>
      <p
        style={{
          marginTop: "8px",
          textAlign: "center",
          color: "#ECEDEE",
          fontSize: "24px !important",
          fontWeight: "700",
        }}
      >
        Every contribution rewarded
      </p>
    </div>
  )
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-8 px-16">
      <Header showsGitHubButton />
      <Title />

      <div className="w-full mt-12">
        <div className="w-full flex justify-end">
          <NewRepositoryModal />
        </div>
        <div className="mt-5 flex flex-col items-center gap-6">
          <RepositoryList />
        </div>
      </div>
    </main>
  );
}
