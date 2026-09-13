import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ModelCard, SensorsCard } from "@/components/readings";
import { getOpstina, getOpstine } from "@/lib/graphql/opstina";
import { eaqiBand } from "@/lib/aqi";
import { Link } from "@/i18n/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { languageAlternates, localizedUrl } from "@/lib/site";

/** Only the slug: the locale segment gets its params from [locale]/layout. */
export async function generateStaticParams() {
  const opstine = await getOpstine();
  return opstine.map((o) => ({ slug: o.slug }));
}

// true (the default) on purpose: with false, an unknown slug short-circuits to
// the global 404 outside the locale layout. With true the page renders,
// getOpstina() returns null and notFound() shows the localised 404. Cost: one
// cached GraphQL call per unknown slug, which the Data Cache absorbs.
export const dynamicParams = true;

type Props = PageProps<"/[locale]/opstina/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  // Same fetch as the page below: request memoization dedupes it within one render.
  const opstina = await getOpstina(slug, locale);
  if (!opstina) notFound();

  const t = await getTranslations({ locale, namespace: "Meta" });
  const tb = await getTranslations({ locale, namespace: "Bands" });
  const m = opstina.model;
  const description = m
    ? t("opstinaDescription", {
        name: opstina.name,
        band: tb(`${eaqiBand(m.eaqi).key}.label`),
        eaqi: m.eaqi ?? "–",
        pm25: m.pm25 ?? "–",
        sensors: opstina.sensors.length,
      })
    : t("opstinaDescriptionNoData", { name: opstina.name });

  const path = `/opstina/${slug}`;
  return {
    title: t("opstinaTitle", { name: opstina.name }),
    description,
    alternates: {
      canonical: hasLocale(routing.locales, locale)
        ? localizedUrl(locale, path)
        : undefined,
      languages: languageAlternates(path),
    },
  };
}

export default async function OpstinaPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const opstina = await getOpstina(slug, locale);
  if (!opstina) notFound();
  const t = await getTranslations("Opstina");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: opstina.name,
    geo: {
      "@type": "GeoCoordinates",
      latitude: opstina.lat,
      longitude: opstina.lon,
    },
    containedInPlace: { "@type": "City", name: "Belgrade" },
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/" className="text-sm underline">
        {t("back")}
      </Link>
      <h1 className="text-3xl font-bold">{opstina.name}</h1>
      <ModelCard reading={opstina.model} />
      <SensorsCard readings={opstina.sensors} />
    </main>
  );
}
