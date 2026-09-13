import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getOpstine } from "@/lib/graphql/opstina";
import { languageAlternates, localizedUrl } from "@/lib/site";

/**
 * One entry per locale per page, each listing every language variant, which
 * is how Google wants hreflang expressed in a sitemap. Built at deploy time;
 * the municipality list does not change between deploys.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const opstine = await getOpstine();
  const paths = ["/", ...opstine.map((o) => `/opstina/${o.slug}`)];
  const lastModified = new Date();

  return paths.flatMap((path) => {
    const languages = languageAlternates(path);
    return routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified,
      changeFrequency: "hourly" as const,
      priority: path === "/" ? 1 : 0.8,
      alternates: { languages },
    }));
  });
}
