import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { ApolloWrapper } from "@/lib/graphql/apollo";
import { cn } from "@/lib/utils";
import { LANG_TAG, routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";

// Inter: Latin, Latin Extended (č ć đ š ž) and Cyrillic in one family.
// Geist has no Cyrillic. Mono is only used for sensor ids, so Geist Mono stays.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** One static tree per locale: /sr, /en, /ru and everything below. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  // generateMetadata runs before the layout body, so validate here too:
  // otherwise /unknown.txt tries to import messages/unknown.txt.json.
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Tells next-intl the locale up front so pages stay static: without this
  // it would read the request, and reading the request makes a page dynamic.
  setRequestLocale(locale);

  return (
    <html
      lang={LANG_TAG[locale]}
      className={cn("h-full antialiased", inter.variable, geistMono.variable)}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Vazduh
            </Link>
            <LocaleSwitcher />
          </header>
          <ApolloWrapper>{children}</ApolloWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
