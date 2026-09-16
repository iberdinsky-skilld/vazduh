import { withSentryConfig } from "@sentry/nextjs/config";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // Global 404 outside /[locale] without rendering a layout; localised 404s
    // are [locale]/not-found.tsx. See src/app/global-not-found.tsx.
    globalNotFound: true,
  },
  env: {
    // Netlify sets CONTEXT at build time (production | deploy-preview | branch-deploy).
    // Inlined into both server and client bundles so Sentry can tell environments apart.
    // An explicit value wins (e2e builds set it); otherwise Netlify's CONTEXT.
    NEXT_PUBLIC_SENTRY_ENV:
      process.env.NEXT_PUBLIC_SENTRY_ENV ??
      process.env.CONTEXT ??
      "development",
    // Netlify's production origin (set in previews too): canonical, hreflang, sitemap.
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.URL ??
      "http://localhost:3000",
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "qa-project",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",
});
