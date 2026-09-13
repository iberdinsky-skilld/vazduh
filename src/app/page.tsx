import { getOpstine } from "@/lib/graphql/opstina";
import { OpstinaPicker } from "@/components/opstina-picker";
import Link from "next/link";

export default async function Home() {
  const opstine = await getOpstine();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Vazduh</h1>
        <p className="text-lg text-foreground/80">
          Air quality in Belgrade, municipality by municipality. Model estimate
          plus the citizen sensors nearest to you, updated hourly.
        </p>
        <nav
          aria-label="Municipalities"
          className="flex flex-wrap gap-x-3 gap-y-1"
        >
          {opstine.map((o) => (
            <Link
              key={o.slug}
              href={`/opstina/${o.slug}`}
              className="text-sm underline underline-offset-2"
            >
              {o.name}
            </Link>
          ))}
        </nav>
      </header>
      <OpstinaPicker opstine={opstine} />
    </main>
  );
}
