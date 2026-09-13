import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import en from "../../messages/en.json";
import sr from "../../messages/sr.json";
import ru from "../../messages/ru.json";
import type { Locale } from "@/i18n/routing";

const MESSAGES = { en, sr, ru } as const;

/**
 * Renders a component the way the [locale] layout does: inside
 * NextIntlClientProvider with real messages, so useTranslations works.
 * Default locale is en so assertions can use the English strings.
 */
export function renderWithIntl(
  ui: ReactElement,
  { locale = "en", ...options }: RenderOptions & { locale?: Locale } = {},
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      {ui}
    </NextIntlClientProvider>,
    options,
  );
}

export * from "@testing-library/react";
