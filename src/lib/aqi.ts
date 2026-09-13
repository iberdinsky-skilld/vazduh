/**
 * European Air Quality Index bands, as published by the EEA, with their
 * official colours. Single source of truth: the badge, the map fill and any
 * future chart read from here. A value belongs to the last band whose `from`
 * it reaches (same semantics as a MapLibre "step" expression).
 */
export const EAQI_SOURCE_URL = "https://airindex.eea.europa.eu/AQI/index.html";

export const EAQI_BANDS = [
  { key: "good", from: 0, color: "#50f0e6", text: "#111" },
  { key: "fair", from: 20, color: "#50ccaa", text: "#111" },
  { key: "moderate", from: 40, color: "#f0e641", text: "#111" },
  { key: "poor", from: 60, color: "#ff5050", text: "#fff" },
  { key: "veryPoor", from: 80, color: "#960032", text: "#fff" },
  { key: "extremelyPoor", from: 100, color: "#7d2181", text: "#fff" },
] as const;

export const EAQI_NO_DATA = {
  key: "noData",
  from: Number.NEGATIVE_INFINITY,
  color: "#d0d0d0",
  text: "#111",
} as const;

/**
 * `key` addresses the band's label and EEA health messages in messages/<locale>.json
 * under "Bands" (general population `advice`, `sensitive` groups). English is
 * quoted from EAQI_SOURCE_URL on 2026-09-13; sr and ru are our translations.
 * `text` is the readable foreground for a badge on `color`.
 */
export type EaqiBand = {
  key: string;
  from: number;
  color: string;
  text: string;
};

/** Upper bound of a band for display, e.g. "20–40". */
export function eaqiRange(index: number): string {
  const b = EAQI_BANDS[index];
  const next = EAQI_BANDS[index + 1];
  return next ? `${b.from}–${next.from}` : `${b.from}+`;
}

export function eaqiBand(value: number | null | undefined): EaqiBand {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EAQI_NO_DATA;
  }
  let band: EaqiBand = EAQI_NO_DATA;
  for (const b of EAQI_BANDS) {
    if (value >= b.from) band = b;
  }
  return band;
}

/**
 * MapLibre "step" expression colouring a feature by its `eaqi` property.
 * Built from EAQI_BANDS so the map can never drift from the badge.
 */
export function eaqiFillExpression(property = "eaqi"): unknown[] {
  const steps = EAQI_BANDS.flatMap((b) => [b.from, b.color]);
  return [
    "step",
    ["coalesce", ["get", property], -1],
    EAQI_NO_DATA.color,
    ...steps,
  ];
}
