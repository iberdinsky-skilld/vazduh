"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { useSuspenseQuery } from "@apollo/client/react";
import { OPSTINA_DOC, type OpstinaListItem } from "@/lib/graphql/opstina";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModelCard, SensorsCard } from "./readings";
import { Legend } from "./legend";
import dynamic from "next/dynamic";

/** Same box on mobile and desktop as the map itself, so nothing shifts. */
const MAP_BOX = "h-80 w-full md:h-[28rem]";

const AirMap = dynamic(() => import("./air-map"), {
  ssr: false,
  loading: () => <div className={`${MAP_BOX} rounded-lg bg-muted`} />,
});

export function OpstinaPicker({ opstine }: { opstine: OpstinaListItem[] }) {
  const t = useTranslations("Picker");
  const [slug, setSlug] = useState("vracar");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Select value={slug} onValueChange={setSlug}>
          <SelectTrigger className="w-full" aria-label={t("label")}>
            <SelectValue placeholder={t("placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("group")}</SelectLabel>
              {opstine.map((o) => (
                <SelectItem key={o.slug} value={o.slug}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Suspense
          fallback={<p className="text-muted-foreground">{t("loading")}</p>}
        >
          <OpstinaReadings slug={slug} />
        </Suspense>
      </div>
      <div className="flex flex-col gap-4 md:self-start">
        <AirMap
          opstine={opstine}
          selected={slug}
          onSelect={setSlug}
          className={MAP_BOX}
        />
        <Legend />
      </div>
    </div>
  );
}

function OpstinaReadings({ slug }: { slug: string }) {
  const t = useTranslations("Picker");
  const { data } = useSuspenseQuery(OPSTINA_DOC, { variables: { slug } });
  const opstina = data.opstina;
  if (!opstina) return <p>{t("unknown")}</p>;
  return (
    <div className="flex flex-col gap-4">
      <ModelCard reading={opstina.model} />
      <SensorsCard readings={opstina.sensors} />
    </div>
  );
}
