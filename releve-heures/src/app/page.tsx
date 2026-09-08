import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ReleveForm from "@/components/ReleveForm";
import AppHeader from "@/components/AppHeader";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-soft flex flex-col">
      <AppHeader active="saisie" />
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 pb-12">
        <ReleveForm intervenantNom={session.user.name || session.user.email || ""} />
      </main>
    </div>
  );
}
