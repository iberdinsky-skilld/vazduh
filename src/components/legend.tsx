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

/** What the colours mean, and what the numbers are. Plain markup, no state. */
export function Legend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to read this</CardTitle>
        <CardDescription>
          Colours follow the{" "}
          <a href={EAQI_SOURCE_URL} className="underline underline-offset-2">
            European Air Quality Index
          </a>{" "}
          (EAQI) of the European Environment Agency. Advice is theirs, not ours.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ol className="flex flex-col gap-2">
          {EAQI_BANDS.map((b, i) => (
            <li
              key={b.label}
              className="grid grid-cols-[1.25rem_5.5rem_1fr] items-baseline gap-x-3"
            >
              <span
                aria-hidden
                className="inline-block size-4 translate-y-0.5 rounded-sm"
                style={{ backgroundColor: b.color }}
              />
              <span className="font-medium">
                {b.label}
                <span className="block text-xs text-muted-foreground">
                  {eaqiRange(i)}
                </span>
              </span>
              <span className="text-sm">
                {b.sensitive === b.advice ? (
                  b.advice
                ) : (
                  <>
                    {b.advice}{" "}
                    <span className="font-medium">Sensitive groups:</span>{" "}
                    {b.sensitive}
                  </>
                )}
              </span>
            </li>
          ))}
          <li className="grid grid-cols-[1.25rem_5.5rem_1fr] items-baseline gap-x-3">
            <span
              aria-hidden
              className="inline-block size-4 translate-y-0.5 rounded-sm"
              style={{ backgroundColor: EAQI_NO_DATA.color }}
            />
            <span className="font-medium">{EAQI_NO_DATA.label}</span>
            <span className="text-sm">No reading for this hour yet.</span>
          </li>
        </ol>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="font-medium">PM2.5</dt>
          <dd>
            Particles under 2.5 µm: smoke, traffic, heating. Small enough to
            reach the bloodstream. The number that matters most.
          </dd>
          <dt className="font-medium">PM10</dt>
          <dd>
            Particles under 10 µm: dust, pollen, road wear. Irritate airways.
          </dd>
          <dt className="font-medium">EAQI</dt>
          <dd>
            0 to 100+. Driven by the worst pollutant of the hour, so it can be
            higher than PM alone suggests.
          </dd>
          <dt className="font-medium">RH</dt>
          <dd>
            Relative humidity. Cheap optical sensors count water droplets as
            dust: above 70 % their PM readings run high.
          </dd>
          <dt className="font-medium">Model vs sensors</dt>
          <dd>
            The model is a Europe-wide forecast on a ~10 km grid, smooth and
            blind to your street. Sensors are real but hyper-local and noisy.
            They disagree often. Both are shown on purpose.
          </dd>
        </dl>

        <p className="text-xs text-muted-foreground">
          Not medical advice. Data: Open-Meteo (CAMS) and sensor.community,
          refreshed hourly.
        </p>
      </CardContent>
    </Card>
  );
}
