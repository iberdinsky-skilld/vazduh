import { useLocale, useTranslations } from "next-intl";
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
import { LANG_TAG, type Locale } from "@/i18n/routing";

/** Above this relative humidity cheap optical sensors over-read PM. */
const HUMIDITY_WARN = 70;

function fmt(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

/** Fixed zone; locale from the route, so server and browser agree. */
function useTimeFormat() {
  const locale = useLocale() as Locale;
  return new Intl.DateTimeFormat(LANG_TAG[locale], {
    timeZone: "Europe/Belgrade",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EaqiBadge({ value }: { value: number | null }) {
  const t = useTranslations("Bands");
  const band = eaqiBand(value);
  return (
    <Badge
      style={{ backgroundColor: band.color, color: band.text }}
      className="border-transparent"
    >
      {value ?? "–"} · {t(`${band.key}.label`)}
    </Badge>
  );
}

export function ModelCard({ reading }: { reading: Measurement | null }) {
  const t = useTranslations("Model");
  const time = useTimeFormat();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {reading ? (
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2">
            <dt className="text-muted-foreground">{t("eaqi")}</dt>
            <dd className="flex flex-col gap-1">
              <div>
                <EaqiBadge value={reading.eaqi} />
              </div>
            </dd>
            <dt className="text-muted-foreground">PM2.5</dt>
            <dd>{fmt(reading.pm25)} µg/m³</dd>
            <dt className="text-muted-foreground">PM10</dt>
            <dd>{fmt(reading.pm10)} µg/m³</dd>
            <dt className="text-muted-foreground">{t("modelHour")}</dt>
            <dd>
              <time dateTime={reading.measuredAt}>
                {time.format(new Date(reading.measuredAt))}
              </time>
            </dd>
            <dt className="text-muted-foreground">{t("pulled")}</dt>
            <dd>
              <time dateTime={reading.fetchedAt}>
                {time.format(new Date(reading.fetchedAt))}
              </time>
            </dd>
          </dl>
        ) : (
          <p className="text-muted-foreground">{t("noData")}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function SensorsCard({ readings }: { readings: Measurement[] }) {
  const t = useTranslations("Sensors");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title", { count: readings.length })}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {readings.length === 0 ? (
          <p className="text-muted-foreground">{t("none")}</p>
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
  const t = useTranslations("Sensors");
  const humid = reading.humidity !== null && reading.humidity > HUMIDITY_WARN;
  return (
    <li className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2">
      <span className="font-mono text-sm text-muted-foreground">
        #{reading.sensorId}
      </span>
      <span>PM2.5 {fmt(reading.pm25)}</span>
      <span>PM10 {fmt(reading.pm10)} µg/m³</span>
      <span className="text-muted-foreground" title={t("rh")}>
        RH {fmt(reading.humidity)}%
      </span>
      {humid && (
        <Badge variant="outline" title={t("humidHint")}>
          {t("humid")}
        </Badge>
      )}
    </li>
  );
}
