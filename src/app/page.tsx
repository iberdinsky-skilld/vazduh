import { getOpstine } from "@/lib/graphql/opstina";
import { OpstinaPicker } from "@/components/opstina-picker";

export default async function Home() {
  const opstine = await getOpstine();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-8">
      <h1 className="text-3xl font-bold">Vazduh — Beograd</h1>
      <OpstinaPicker opstine={opstine} />
    </main>
  );
}
