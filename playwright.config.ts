import { defineConfig, devices } from "@playwright/test";

const MOCK_PORT = 4001;
const APP_PORT = 3100;

/**
 * E2E against a production build whose NEXT_PUBLIC_GRAPHQL_URL points at
 * the mock GraphQL server (tests/mock/graphql-server.mjs). NEXT_PUBLIC_*
 * values are inlined at build time, so the build itself runs here with that
 * env; the mock is started first because generateStaticParams needs it.
 */
export default defineConfig({
  testDir: "tests/e2e",
  // The mock backend has shared mutable state (up/down): one worker only.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `node tests/mock/graphql-server.mjs`,
      url: `http://localhost:${MOCK_PORT}/__control`,
      reuseExistingServer: !process.env.CI,
      env: { MOCK_GRAPHQL_PORT: String(MOCK_PORT) },
    },
    {
      command: `npm run build && npm run start -- -p ${APP_PORT}`,
      url: `http://localhost:${APP_PORT}/sr`,
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_GRAPHQL_URL: `http://localhost:${MOCK_PORT}/graphql`,
        // 127.0.0.1, not localhost: inside the server localhost resolves to ::1 and
        // next start listens on IPv4, so the after() warm-up would ECONNREFUSED.
        NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${APP_PORT}`,
        REVALIDATE_SECRET: "e2e-secret",
        // Never ship e2e errors to the real Sentry project.
        NEXT_PUBLIC_SENTRY_ENV: "e2e",
      },
    },
  ],
});
