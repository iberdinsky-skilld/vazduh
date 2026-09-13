"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import "maplibre-gl/dist/maplibre-gl.css";
import type { OpstinaListItem } from "@/lib/graphql/opstina";
import { eaqiFillExpression } from "@/lib/aqi";
import { cn } from "@/lib/utils";

type Props = {
  opstine: OpstinaListItem[];
  selected: string;
  onSelect: (slug: string) => void;
  className?: string;
};

export default function AirMap({
  opstine,
  selected,
  onSelect,
  className,
}: Props) {
  // React does not own what is inside the map; it only needs the container
  // element and a handle on the instance.
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Decided once, during the first client render (this component never
  // renders on the server): old browsers without WebGL2 get a note, not a crash.
  const [supported] = useState(() => {
    try {
      return !!document.createElement("canvas").getContext("webgl2");
    } catch {
      return false;
    }
  });
  const t = useTranslations("Map");
  // Latest onSelect for the click handler without recreating the map when
  // the parent re-renders (setSlug is a new function every render).
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!supported) return;
    // Create the map once. Cleanup is mandatory: StrictMode runs this effect
    // twice in dev, and without remove() there would be two maps in one div.
    // See scripts/copy-maplibre-worker.mjs: Turbopack cannot serve the
    // worker module from MapLibre's import.meta.url-relative path.
    maplibregl.setWorkerUrl("/map/maplibre/maplibre-gl-worker.mjs");
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: container.current!,
        center: [20.46, 44.72],
        zoom: 8.6,
        style: {
          version: 8,
          glyphs:
            "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
          sprite:
            "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
          sources: {
            protomaps: {
              type: "vector",
              url: `pmtiles://${location.origin}/map/belgrade.pmtiles`,
              attribution:
                '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
            },
          },
          layers: layers("protomaps", namedFlavor("light"), { lang: "en" }),
        },
      });
    } catch (e) {
      // Should not happen once WebGL2 is confirmed; report, do not take the page down.
      console.error("[air-map] map init failed", e);
      return;
    }

    map.on("load", async () => {
      // Bare polygons + EAQI from props → one GeoJSON with eaqi in properties,
      // so the fill colour is a style expression, not React state.
      const eaqiBySlug = new Map(
        opstine.map((o) => [o.slug, o.model?.eaqi ?? null]),
      );
      const geojson = await fetch("/map/opstine.geojson").then((r) => r.json());
      for (const f of geojson.features) {
        f.properties.eaqi = eaqiBySlug.get(f.properties.slug) ?? null;
      }
      map.addSource("opstine", { type: "geojson", data: geojson });
      map.addLayer({
        id: "opstine-fill",
        type: "fill",
        source: "opstine",
        paint: {
          "fill-color": eaqiFillExpression() as never,
          "fill-opacity": 0.45,
        },
      });
      map.addLayer({
        id: "opstine-line",
        type: "line",
        source: "opstine",
        paint: { "line-color": "#333", "line-width": 1 },
      });
      map.addLayer({
        id: "opstine-selected",
        type: "line",
        source: "opstine",
        filter: ["==", ["get", "slug"], selected],
        paint: { "line-color": "#111", "line-width": 3 },
      });
      map.on("click", "opstine-fill", (e) => {
        const slug = e.features?.[0]?.properties?.slug;
        if (typeof slug === "string") onSelectRef.current(slug);
      });
      map.on("mouseenter", "opstine-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "opstine-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;
    map.on("error", (e) => console.error("[air-map] error", e.error));

    return () => {
      map.remove();
      maplibregl.removeProtocol("pmtiles");
      mapRef.current = null;
    };
    // opstine and selected are read once at load; the map is not rebuilt when
    // props change. Selection changes are applied by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selection change: do not rebuild the map, just refilter one layer.
  // getLayer() guards the first run, which happens before "load".
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("opstine-selected")) return;
    map.setFilter("opstine-selected", ["==", ["get", "slug"], selected]);
  }, [selected]);

  if (!supported) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-lg border bg-muted p-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {t("unsupported")}
      </div>
    );
  }

  return (
    <div
      ref={container}
      className={cn("w-full rounded-lg border", className)}
    />
  );
}
