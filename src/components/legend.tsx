import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EAQI_BANDS,
  EAQI_NO_DATA,
  EAQI_SOURCE_URL,
  eaqiRange,
} from "@/lib/aqi";

const ROW = "grid grid-cols-[1.25rem_5.5rem_1fr] items-baseline gap-x-3";

/** What the colours mean, and what the numbers are. Plain markup, no state. */
export function Legend() {
  const t = useTranslations("Legend");
  const tb = useTranslations("Bands");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t.rich("intro", {
            link: (chunks) => (
              <a
                href={EAQI_SOURCE_URL}
                className="underline underline-offset-2"
              >
                {chunks}
              </a>
            ),
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ol className="flex flex-col gap-2">
          {EAQI_BANDS.map((b, i) => {
            const advice = tb(`${b.key}.advice`);
            const sensitive = tb(`${b.key}.sensitive`);
            return (
              <li key={b.key} className={ROW}>
                <span
                  aria-hidden
                  className="inline-block size-4 translate-y-0.5 rounded-sm"
                  style={{ backgroundColor: b.color }}
                />
                <span className="font-medium">
                  {tb(`${b.key}.label`)}
                  <span className="block text-xs text-muted-foreground">
                    {eaqiRange(i)}
                  </span>
                </span>
                <span className="text-sm">
                  {sensitive === advice ? (
                    advice
                  ) : (
                    <>
                      {advice}{" "}
                      <span className="font-medium">
                        {t("sensitiveGroups")}
                      </span>{" "}
                      {sensitive}
                    </>
                  )}
                </span>
              </li>
            );
          })}
          <li className={ROW}>
            <span
              aria-hidden
              className="inline-block size-4 translate-y-0.5 rounded-sm"
              style={{ backgroundColor: EAQI_NO_DATA.color }}
            />
            <span className="font-medium">{tb("noData.label")}</span>
            <span className="text-sm">{t("noDataHint")}</span>
          </li>
        </ol>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="font-medium">PM2.5</dt>
          <dd>{t("pm25")}</dd>
          <dt className="font-medium">PM10</dt>
          <dd>{t("pm10")}</dd>
          <dt className="font-medium">EAQI</dt>
          <dd>{t("eaqi")}</dd>
          <dt className="font-medium">RH</dt>
          <dd>{t("rh")}</dd>
          <dt className="font-medium">{t("modelVsSensorsTerm")}</dt>
          <dd>{t("modelVsSensors")}</dd>
        </dl>

        <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  );
}
