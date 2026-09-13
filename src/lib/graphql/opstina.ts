import { fetchGraphQL } from "./client";
import { gql, type TypedDocumentNode } from "@apollo/client";

/**
 * Hand-written types for exactly the fields the query below asks for.
 * The shape is dictated by the query, not by the schema, so they live together.
 */
export type Measurement = {
  source: "open_meteo" | "sensor_community";
  sensorId: string;
  /** ISO 8601, UTC — when the source measured it. */
  measuredAt: string;
  /** ISO 8601, UTC — when Drupal's cron pulled it. */
  fetchedAt: string;
  pm25: number | null;
  pm10: number | null;
  /** European AQI; model rows only. */
  eaqi: number | null;
  /** Relative humidity, %; cheap sensors over-read PM above ~70. */
  humidity: number | null;
};

export type Opstina = {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  /** Latest Open-Meteo model reading, null if cron has not run yet. */
  model: Measurement | null;
  /** Latest reading per citizen sensor inside the municipality. */
  sensors: Measurement[];
};

export type OpstinaListItem = Pick<Opstina, "slug" | "name" | "model">;

export type OpstinaData = { opstina: Opstina | null };
/** `lang` picks the municipality name translation (sr, en, ru); slug is language-neutral. */
export type OpstinaVars = { slug: string; lang?: string };

const MEASUREMENT_FIELDS = `
  source
  sensorId
  measuredAt
  fetchedAt
  pm25
  pm10
  eaqi
  humidity
`;

const OPSTINA_QUERY = `
  query Opstina($slug: String!, $lang: String) {
    opstina(slug: $slug, lang: $lang) {
      slug
      name
      lat
      lon
      model { ${MEASUREMENT_FIELDS} }
      sensors { ${MEASUREMENT_FIELDS} }
    }
  }
`;

const OPSTINE_QUERY = `
  query Opstine($lang: String) {
    opstine(lang: $lang) {
      slug
      name
      model { eaqi }
    }
  }
`;

/** Returns null for an unknown slug — the page decides between 404 and fallback. */
export async function getOpstina(
  slug: string,
  lang?: string,
): Promise<Opstina | null> {
  const data = await fetchGraphQL<OpstinaData>(OPSTINA_QUERY, { slug, lang });
  return data.opstina;
}

export async function getOpstine(lang?: string): Promise<OpstinaListItem[]> {
  const data = await fetchGraphQL<{ opstine: OpstinaListItem[] }>(
    OPSTINE_QUERY,
    { lang },
  );
  return data.opstine;
}

export const OPSTINA_DOC: TypedDocumentNode<OpstinaData, OpstinaVars> =
  gql(OPSTINA_QUERY);
