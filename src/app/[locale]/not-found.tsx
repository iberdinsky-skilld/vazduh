import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-16">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p>{t("text")}</p>
      <Link href="/" className="underline underline-offset-2">
        {t("back")}
      </Link>
    </main>
  );
}
