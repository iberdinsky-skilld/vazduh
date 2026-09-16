import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

/**
 * Called by Drupal's cron right after it stored a new hour of measurements.
 *
 * Marks everything tagged "air" as expired. Profiles decide who pays for
 * freshness:
 *  - "max": stale-while-revalidate. The next visitor of each page still gets
 *    the old copy and triggers a rebuild for the one after. Right for a blog,
 *    wrong here: 54 pages would each need two visits to catch up.
 *  - { expire: 0 }: stale is never served. The next visitor waits ~1s for the
 *    rebuild and sees the current hour. Data changes hourly, correctness wins.
 *
 * Then, after the response has gone back to Drupal, warms the three home
 * pages so the first real visitor finds them already rebuilt. Municipality
 * pages stay lazy: 51 of them, rarely visited, rebuilt on demand.
 *
 * If revalidateTag throws we let it: Next.js answers 500 and onRequestError in
 * instrumentation.ts reports it to Sentry with a stack. Catching it here would
 * only hide that.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return new Response("Invalid secret", { status: 401 });
  }

  revalidateTag("air", { expire: 0 });

  // Runs after the response is sent (waitUntil on Netlify). Plain fetches to
  // our own URLs go through the CDN, so the edge copies refresh too.
  after(async () => {
    const results = await Promise.allSettled(
      routing.locales.map((locale) =>
        fetch(`${SITE_URL}/${locale}`, {
          cache: "no-store",
          headers: { "x-vazduh-warmup": "1" },
        }),
      ),
    );
    const summary = results.map((r, i) =>
      r.status === "fulfilled"
        ? `${routing.locales[i]}:${r.value.status}`
        : `${routing.locales[i]}:failed(${r.reason instanceof Error ? `${r.reason.message} ${(r.reason as { cause?: { code?: string } }).cause?.code ?? ""}` : String(r.reason)})`,
    );
    console.log(`[revalidate] warmed ${summary.join(" ")}`);
  });

  return Response.json({
    revalidated: true,
    at: new Date().toISOString(),
    warming: routing.locales.map((l) => `/${l}`),
  });
}
