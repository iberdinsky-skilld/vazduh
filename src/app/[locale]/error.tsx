"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { BackendError } from "@/components/backend-error";

/**
 * Route-level error boundary for the locale tree: server render failures
 * (e.g. Drupal down while rendering a not-yet-cached page) land here.
 * Next.js only passes a digest for server errors, so report it explicitly.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-16">
      <BackendError onRetry={reset} />
    </main>
  );
}
