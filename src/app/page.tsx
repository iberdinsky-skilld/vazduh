import { getOpstina, type Measurement } from "@/lib/graphql/opstina";

const HUMIDITY_WARN = 70;

export default async function Home() {
  const opstina = await getOpstina("vracar");
  if (!opstina) {
    throw new Error("Municipality vracar is missing from the backend");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-8">
      <h1 className="text-3xl font-bold">Vazduh — {opstina.name}</h1>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Model (Open-Meteo)</h2>
        {opstina.model ? (
          <ModelReading reading={opstina.model} />
        ) : (
          <p>No model data yet.</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">
          Sensors in the municipality ({opstina.sensors.length})
        </h2>
        {opstina.sensors.length === 0 ? (
          <p>No citizen sensor here yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {opstina.sensors.map((s) => (
              <SensorReading key={s.sensorId} reading={s} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function ModelReading({ reading }: { reading: Measurement }) {
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

function SensorReading({ reading }: { reading: Measurement }) {
  const humid = reading.humidity !== null && reading.humidity > HUMIDITY_WARN;
  return (
    <li>
      #{reading.sensorId}: PM2.5 {fmt(reading.pm25)}, PM10 {fmt(reading.pm10)}{" "}
      µg/m³, RH {fmt(reading.humidity)}%
      {humid && " (humid — sensor may over-read)"}
    </li>
  );
}

function fmt(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}
