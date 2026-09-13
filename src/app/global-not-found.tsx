import "./globals.css";

/**
 * Global 404: served by the router for URLs that match no route at all
 * (e.g. /unknown.txt), without rendering any layout. Localised 404s under
 * /[locale] are [locale]/not-found.tsx via the [...rest] catch-all.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-16">
          <h1 className="text-3xl font-bold">Page not found</h1>
          <a href="/" className="underline underline-offset-2">
            ← Vazduh
          </a>
        </main>
      </body>
    </html>
  );
}
