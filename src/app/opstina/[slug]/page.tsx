import { ModelCard, SensorsCard } from "@/components/readings";
import { getOpstina, getOpstine } from "@/lib/graphql/opstina";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eaqiBand } from "@/lib/aqi";

export async function generateStaticParams() {
  const opstine = await getOpstine();
  return opstine.map((o) => ({ slug: o.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/opstina/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  // Same fetch as the page below: request memoization dedupes it within one render.
  const opstina = await getOpstina(slug);
  if (!opstina) notFound();

  const m = opstina.model;
  const band = eaqiBand(m?.eaqi ?? null);
  const description = m
    ? `${opstina.name} right now: ${band.label} (EAQI ${m.eaqi ?? "–"}), PM2.5 ${m.pm25 ?? "–"} µg/m³. Model estimate plus ${opstina.sensors.length} citizen sensors, updated hourly.`
    : `Air quality in ${opstina.name}, Belgrade: model estimate and citizen sensors, updated hourly.`;

  return {
    title: `${opstina.name}: air quality now`,
    description,
  };
}

export default async function OpstinaPage({
  params,
}: PageProps<"/opstina/[slug]">) {
  const { slug } = await params;
  const opstina = await getOpstina(slug);
  if (!opstina) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: opstina.name,
    geo: {
      "@type": "GeoCoordinates",
      latitude: opstina.lat,
      longitude: opstina.lon,
    },
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
        ← All municipalities
      </Link>
      <h1 className="text-3xl font-bold">{opstina.name}</h1>
      <ModelCard reading={opstina.model} />
      <SensorsCard readings={opstina.sensors} />
    </main>
  );
}
