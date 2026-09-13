import { defineRouting } from "next-intl/routing";

/**
 * sr is Serbian in Latin script (what Serbian websites use); the html lang
 * attribute says sr-Latn, the URL prefix stays a plain /sr/.
 */
export const routing = defineRouting({
  locales: ["sr", "en", "ru"],
  defaultLocale: "sr",
});

export type Locale = (typeof routing.locales)[number];

/** BCP 47 tags for Intl formatting and <html lang>. */
export const LANG_TAG: Record<Locale, string> = {
  sr: "sr-Latn-RS",
  en: "en-GB",
  ru: "ru-RU",
};
