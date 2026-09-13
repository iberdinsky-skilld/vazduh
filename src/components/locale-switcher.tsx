"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABEL: Record<Locale, string> = { sr: "SR", en: "EN", ru: "RU" };
const NAME: Record<Locale, string> = {
  sr: "Srpski",
  en: "English",
  ru: "Русский",
};

/** Same page, other locale: usePathname() from next-intl strips the prefix. */
export function LocaleSwitcher() {
  const current = useLocale();
  const pathname = usePathname();
  return (
    <nav aria-label="Language" className="flex items-center gap-1 text-sm">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          hrefLang={locale}
          lang={locale}
          title={NAME[locale]}
          aria-current={locale === current ? "true" : undefined}
          className={cn(
            "rounded px-2 py-1 hover:bg-muted",
            locale === current
              ? "font-semibold text-foreground"
              : "text-muted-foreground",
          )}
        >
          {LABEL[locale]}
        </Link>
      ))}
    </nav>
  );
}
