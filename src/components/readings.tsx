import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Measurement } from "@/lib/graphql/opstina";
import { eaqiBand } from "@/lib/aqi";

/** Above this relative humidity cheap optical sensors over-read PM. */
const HUMIDITY_WARN = 70;

const belgradeTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Belgrade",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function fmt(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

/** Fixed locale and zone: the same string on the server and in the browser. */
function fmtTime(iso: string): string {
  return belgradeTime.format(new Date(iso));
}

export function EaqiBadge({ value }: { value: number | null }) {
  const band = eaqiBand(value);
  return (
    <Badge
      style={{ backgroundColor: band.color, color: band.text }}
      className="border-transparent"
    >
      {value ?? "–"} · {band.label}
    </Badge>
  );
}

export function ModelCard({ reading }: { reading: Measurement | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model estimate</CardTitle>
        <CardDescription>
          Copernicus CAMS forecast via Open-Meteo, read at the centre of the
          municipality. Same for everyone within a few kilometres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reading ? (
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2">
            <dt className="text-muted-foreground">European AQI</dt>
            <dd className="flex flex-col gap-1">
              <div>
                <EaqiBadge value={reading.eaqi} />
              </div>
            </dd>
            <dt className="text-muted-foreground">PM2.5</dt>
            <dd>{fmt(reading.pm25)} µg/m³</dd>
            <dt className="text-muted-foreground">PM10</dt>
            <dd>{fmt(reading.pm10)} µg/m³</dd>
            <dt className="text-muted-foreground">Model hour</dt>
            <dd>
              <time dateTime={reading.measuredAt}>
                {fmtTime(reading.measuredAt)}
              </time>
            </dd>
            <dt className="text-muted-foreground">Pulled</dt>
            <dd>
              <time dateTime={reading.fetchedAt}>
                {fmtTime(reading.fetchedAt)}
              </time>
            </dd>
          </dl>
        ) : (
          <p className="text-muted-foreground">No model data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function SensorsCard({ readings }: { readings: Measurement[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Citizen sensors ({readings.length})</CardTitle>
        <CardDescription>
          sensor.community devices on balconies inside the municipality, latest
          hour. Real measurements, but each one sees only its own street.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {readings.length === 0 ? (
          <p className="text-muted-foreground">
            No citizen sensor here yet. Put one up: sensor.community kits cost
            about €40.
          </p>
        ) : (
          <ul className="divide-y">
            {readings.map((r) => (
              <SensorRow key={r.sensorId} reading={r} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SensorRow({ reading }: { reading: Measurement }) {
  const humid = reading.humidity !== null && reading.humidity > HUMIDITY_WARN;
  return (
    <li className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2">
      <span className="font-mono text-sm text-muted-foreground">
        #{reading.sensorId}
      </span>
      <span>PM2.5 {fmt(reading.pm25)}</span>
      <span>PM10 {fmt(reading.pm10)} µg/m³</span>
      <span className="text-muted-foreground" title="Relative humidity">
        RH {fmt(reading.humidity)}%
      </span>
      {humid && (
        <Badge
          variant="outline"
          title="Optical sensors over-read PM when humid"
        >
          humid
        </Badge>
      )}
    </li>
  );
}
