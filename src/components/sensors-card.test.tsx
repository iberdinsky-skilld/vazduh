import { describe, expect, it } from "vitest";
import { renderWithIntl, screen } from "@/test/render";
import { SensorsCard } from "./readings";
import type { Measurement } from "@/lib/graphql/opstina";

function sensor(overrides: Partial<Measurement> = {}): Measurement {
  return {
    source: "sensor_community",
    sensorId: "1",
    measuredAt: "2026-09-13T10:00:00+00:00",
    fetchedAt: "2026-09-13T10:05:00+00:00",
    pm25: 4.2,
    pm10: 7.9,
    eaqi: null,
    humidity: 40,
    ...overrides,
  };
}

describe("SensorsCard", () => {
  it("explains the empty state and invites to install a sensor", () => {
    renderWithIntl(<SensorsCard readings={[]} />);
    // shadcn's CardTitle is a div, not a heading, so match by text.
    expect(screen.getByText("Citizen sensors (0)")).toBeInTheDocument();
    expect(screen.getByText(/sensor.community kits/)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders one row per sensor", () => {
    const readings = [
      sensor({ sensorId: "a" }),
      sensor({ sensorId: "b" }),
      sensor({ sensorId: "c" }),
    ];
    renderWithIntl(<SensorsCard readings={readings} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Citizen sensors (3)")).toBeInTheDocument();
  });

  it("flags only the humid sensor", () => {
    renderWithIntl(
      <SensorsCard
        readings={[
          sensor({ sensorId: "dry", humidity: 40 }),
          sensor({ sensorId: "wet", humidity: 80 }),
        ]}
      />,
    );
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).not.toHaveTextContent("humid");
    expect(rows[1]).toHaveTextContent("humid");
  });

  it("shows a dash for missing values instead of crashing", () => {
    renderWithIntl(
      <SensorsCard readings={[sensor({ pm25: null, humidity: null })]} />,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("PM2.5 —");
    expect(screen.getByRole("listitem")).toHaveTextContent("RH —%");
  });
});
