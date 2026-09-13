import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Private working notes, gitignored; not part of the app.
    "docs/**",
    // Vendored MapLibre worker, copied on postinstall.
    "public/map/maplibre/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
