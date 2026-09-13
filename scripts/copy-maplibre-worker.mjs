// MapLibre 6 loads its worker as a separate ES module resolved relative to
// import.meta.url. Under Turbopack that relative path does not exist, so we
// serve the worker (and the shared module it imports) from public/ and point
// MapLibre at it with setWorkerUrl(). Runs on postinstall; output is gitignored.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "node_modules/maplibre-gl/dist");
const dest = join(root, "public/map/maplibre");
mkdirSync(dest, { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(src, f), join(dest, f));
}
console.log("maplibre worker copied to public/map/maplibre");
