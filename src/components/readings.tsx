import { Measurement } from "@/lib/graphql/opstina";

const HUMIDITY_WARN = 70;

function fmt(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

export function ModelReading({ reading }: { reading: Measurement }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-1">
      <dt>European AQI</dt>
      <dd>{reading.eaqi ?? "—"}</dd>
      <dt>PM2.5</dt>
      <dd>{fmt(reading.pm25)} µg/m³</dd>
      <dt>PM10</dt>
      <dd>{fmt(reading.pm10)} µg/m³</dd>
      <dt>Measured at</dt>
      <dd>
        <time dateTime={reading.measuredAt}>{reading.measuredAt}</time>
      </dd>
      <dt>Fetched by cron at</dt>
      <dd>
        <time dateTime={reading.fetchedAt}>{reading.fetchedAt}</time>
      </dd>
    </dl>
  );
}

export function SensorReading({ reading }: { reading: Measurement }) {
  const humid = reading.humidity !== null && reading.humidity > HUMIDITY_WARN;
  return (
    <li>
      #{reading.sensorId}: PM2.5 {fmt(reading.pm25)}, PM10 {fmt(reading.pm10)}{" "}
      µg/m³, RH {fmt(reading.humidity)}%
      {humid && " (humid — sensor may over-read)"}
    </li>
  );
}
