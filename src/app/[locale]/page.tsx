import { getTranslations, setRequestLocale } from "next-intl/server";
import { getOpstine } from "@/lib/graphql/opstina";
import { OpstinaPicker } from "@/components/opstina-picker";
import { Link } from "@/i18n/navigation";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const opstine = await getOpstine(locale);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-4 pb-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-foreground/80">{t("tagline")}</p>
        <nav aria-label={t("nav")} className="flex flex-wrap gap-x-3 gap-y-1">
          {opstine.map((o) => (
            <Link
              key={o.slug}
              href={`/opstina/${o.slug}`}
              className="text-sm underline underline-offset-2"
            >
              {o.name}
            </Link>
          ))}
        </nav>
      </header>
      <OpstinaPicker opstine={opstine} />
    </main>
  );
}
