import { routing, type Locale } from "@/i18n/routing";

/**
 * Absolute site origin for canonical URLs, hreflang and the sitemap.
 * Netlify sets URL to the production origin at build time (also in deploy
 * previews), which is what search engines should see as canonical.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** hreflang value per locale; sr is Serbian in Latin script. */
export const HREFLANG: Record<Locale, string> = {
  sr: "sr-Latn",
  en: "en",
  ru: "ru",
};

/** `path` is locale-less, e.g. "/" or "/opstina/zemun". */
export function localizedUrl(locale: Locale, path: string): string {
  const suffix = path === "/" ? "" : path;
  return `${SITE_URL}/${locale}${suffix}`;
}

/**
 * Every locale's URL for one page plus x-default, keyed by hreflang.
 * The same object feeds Metadata.alternates.languages and the sitemap.
 */
export function languageAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of routing.locales) {
    out[HREFLANG[locale]] = localizedUrl(locale, path);
  }
  out["x-default"] = localizedUrl(routing.defaultLocale, path);
  return out;
}
