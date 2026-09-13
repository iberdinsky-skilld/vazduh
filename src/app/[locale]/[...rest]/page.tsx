import { notFound } from "next/navigation";

/**
 * Catch-all under the locale segment. Without it an unknown path such as
 * /sr/xyz falls through to the global 404 outside [locale]/layout, i.e.
 * without messages or lang. This makes it render [locale]/not-found.tsx.
 */
export default function CatchAll() {
  notFound();
}
