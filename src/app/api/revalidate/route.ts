import { revalidateTag } from "next/cache";

/**
 * Marks everything tagged "air" as stale. The next visit to a page using that
 * data triggers a background rebuild; with "max" the visitor still gets the
 * stale page while it rebuilds (stale-while-revalidate).
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

  revalidateTag("air", "max");

  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
