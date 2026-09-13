import { describe, expect, it, vi } from "vitest";
import { renderWithIntl, screen } from "@/test/render";
import { LocaleSwitcher } from "./locale-switcher";

/**
 * next-intl's navigation helpers need the App Router context, which jsdom
 * has no idea about. Mock the module: Link becomes a plain anchor that shows
 * where it would go, usePathname returns a fixed page.
 */
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/opstina/zemun",
  Link: ({
    href,
    locale,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    locale?: string;
  }) => (
    <a href={`/${locale}${href}`} {...rest}>
      {children}
    </a>
  ),
}));

describe("LocaleSwitcher", () => {
  it("links the same page in every locale and marks the current one", () => {
    renderWithIntl(<LocaleSwitcher />, { locale: "ru" });
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/sr/opstina/zemun",
      "/en/opstina/zemun",
      "/ru/opstina/zemun",
    ]);
    expect(screen.getByRole("link", { name: "RU" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "EN" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("is a labelled navigation landmark", () => {
    renderWithIntl(<LocaleSwitcher />);
    expect(
      screen.getByRole("navigation", { name: "Language" }),
    ).toBeInTheDocument();
  });
});
