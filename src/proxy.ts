import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** Adds the locale prefix and redirects / by Accept-Language. */
export default createMiddleware(routing);

export const config = {
  // Everything except: API routes, the Sentry tunnel, Next internals, and
  // files with an extension (map tiles, worker, favicon, ...).
  matcher: "/((?!api|monitoring|_next|_vercel|.*\\..*).*)",
};
