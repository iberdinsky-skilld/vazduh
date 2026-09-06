import { getCurrentAir } from "@/lib/sources/open-meteo";

export default async function Home() {
  const air = await getCurrentAir();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-3xl font-bold">Vazduh — Beograd</h1>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
        <dt>European AQI</dt>
        <dd>{air.europeanAqi}</dd>
        <dt>PM2.5</dt>
        <dd>{air.pm25} µg/m³</dd>
        <dt>PM10</dt>
        <dd>{air.pm10} µg/m³</dd>
        <dt>Measured at</dt>
        <dd>
          <time dateTime={air.time}>{air.time}</time>
        </dd>
        <dt>Fetched at</dt>
        <dd>
          <time dateTime={air.fetchedAt}>{air.fetchedAt}</time>
        </dd>
      </dl>
    </main>
  );
}
