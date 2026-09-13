import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-16">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p>
        No such page. Belgrade has 17 municipalities and each has its own page;
        the full list is on the home page.
      </p>
      <Link href="/" className="underline underline-offset-2">
        ← Back to all municipalities
      </Link>
    </main>
  );
}
