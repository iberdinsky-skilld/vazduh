"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/** Shown instead of live readings when the GraphQL backend fails. */
export function BackendError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("Error");
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
    >
      <p className="font-medium">{t("title")}</p>
      <p className="text-sm">{t("backend")}</p>
      <div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
