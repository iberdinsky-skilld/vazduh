/**
 * European Air Quality Index bands, as published by the EEA, with their
 * official colours. Single source of truth: the badge, the map fill and any
 * future chart read from here. A value belongs to the last band whose `from`
 * it reaches (same semantics as a MapLibre "step" expression).
 */
export const EAQI_SOURCE_URL = "https://airindex.eea.europa.eu/AQI/index.html";

export const EAQI_BANDS = [
  {
    from: 0,
    label: "Good",
    color: "#50f0e6",
    text: "#111",
    advice: "The air quality is good. Enjoy your usual outdoor activities.",
    sensitive: "The air quality is good. Enjoy your usual outdoor activities.",
  },
  {
    from: 20,
    label: "Fair",
    color: "#50ccaa",
    text: "#111",
    advice: "Enjoy your usual outdoor activities.",
    sensitive: "Enjoy your usual outdoor activities.",
  },
  {
    from: 40,
    label: "Moderate",
    color: "#f0e641",
    text: "#111",
    advice: "Enjoy your usual outdoor activities.",
    sensitive:
      "Consider reducing intense outdoor activities, if you experience symptoms.",
  },
  {
    from: 60,
    label: "Poor",
    color: "#ff5050",
    text: "#fff",
    advice:
      "Consider reducing intense activities outdoors, if you experience symptoms such as sore eyes, a cough or sore throat.",
    sensitive:
      "Consider reducing physical activities, particularly outdoors, especially if you experience symptoms.",
  },
  {
    from: 80,
    label: "Very poor",
    color: "#960032",
    text: "#fff",
    advice:
      "Consider reducing intense activities outdoors, if you experience symptoms such as sore eyes, a cough or sore throat.",
    sensitive:
      "Reduce physical activities, particularly outdoors, especially if you experience symptoms.",
  },
  {
    from: 100,
    label: "Extremely poor",
    color: "#7d2181",
    text: "#fff",
    advice: "Reduce physical activities outdoors.",
    sensitive: "Avoid physical activities outdoors.",
  },
] as const;

export const EAQI_NO_DATA = {
  label: "No data",
  color: "#d0d0d0",
  text: "#111",
  advice: "",
  sensitive: "",
} as const;

/**
 * `text` is the readable foreground for a badge on `color`. `advice` and
 * `sensitive` are the EEA index messages for the general population and for
 * sensitive groups (children, elderly, people with respiratory or heart
 * conditions), quoted from EAQI_SOURCE_URL on 2026-09-13; only trailing
 * full stops were normalised. We do not write health advice ourselves.
 */
export type EaqiBand = {
  label: string;
  color: string;
  text: string;
  advice: string;
  sensitive: string;
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
