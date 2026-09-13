"use client";

import { Suspense, useState } from "react";
import { useSuspenseQuery } from "@apollo/client/react";
import { OPSTINA_DOC, type OpstinaListItem } from "@/lib/graphql/opstina";
import { ModelReading, SensorReading } from "./readings";
import dynamic from "next/dynamic";

const AirMap = dynamic(() => import("./air-map"), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded bg-gray-100" />,
});

export function OpstinaPicker({ opstine }: { opstine: OpstinaListItem[] }) {
  const [slug, setSlug] = useState("vracar");
  return (
    <>
      <select
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="mb-4 rounded border border-gray-300 bg-white p-4 text-lg"
      >
        {opstine.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </select>
      <Suspense fallback={<p>Loading…</p>}>
        <OpstinaReadings slug={slug} />
        <AirMap opstine={opstine} selected={slug} onSelect={setSlug} />
      </Suspense>
    </>
  );
}

function OpstinaReadings({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(OPSTINA_DOC, { variables: { slug } });
  const opstina = data.opstina;
  if (!opstina) return <p>Unknown municipality.</p>;
  return (
    <>
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
    </>
  );
}
