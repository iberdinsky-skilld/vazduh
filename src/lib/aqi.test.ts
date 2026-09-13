import { describe, expect, it } from "vitest";
import {
  EAQI_BANDS,
  EAQI_NO_DATA,
  eaqiBand,
  eaqiFillExpression,
  eaqiRange,
} from "./aqi";

describe("eaqiBand", () => {
  it.each([
    [0, "good"],
    [19, "good"],
    [20, "fair"],
    [39.9, "fair"],
    [40, "moderate"],
    [60, "poor"],
    [80, "veryPoor"],
    [100, "extremelyPoor"],
    [250, "extremelyPoor"],
  ])(
    "%s → %s (lower bound inclusive, like a step expression)",
    (value, key) => {
      expect(eaqiBand(value).key).toBe(key);
    },
  );

  it("treats null, undefined and NaN as no data", () => {
    expect(eaqiBand(null)).toBe(EAQI_NO_DATA);
    expect(eaqiBand(undefined)).toBe(EAQI_NO_DATA);
    expect(eaqiBand(Number.NaN)).toBe(EAQI_NO_DATA);
  });
});

describe("eaqiFillExpression", () => {
  it("uses exactly the band thresholds and colours, in order", () => {
    const expr = eaqiFillExpression();
    // ["step", <input>, <no-data colour>, from1, colour1, from2, colour2, ...]
    const steps = expr.slice(3);
    expect(expr[0]).toBe("step");
    expect(expr[2]).toBe(EAQI_NO_DATA.color);
    expect(steps).toEqual(EAQI_BANDS.flatMap((b) => [b.from, b.color]));
  });

  it("reads the given property", () => {
    expect(JSON.stringify(eaqiFillExpression("aqi"))).toContain(
      '["get","aqi"]',
    );
  });
});

describe("eaqiRange", () => {
  it("formats bounded and open-ended bands", () => {
    expect(eaqiRange(0)).toBe("0–20");
    expect(eaqiRange(EAQI_BANDS.length - 1)).toBe("100+");
  });
});
