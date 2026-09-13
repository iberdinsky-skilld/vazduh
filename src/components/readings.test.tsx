import { describe, expect, it } from "vitest";
import { renderWithIntl, screen } from "@/test/render";
import { EaqiBadge } from "./readings";

/** Example test proving the pipeline: jsdom + Testing Library + next-intl messages. */
describe("EaqiBadge", () => {
  it("shows the value and the band label from messages", () => {
    renderWithIntl(<EaqiBadge value={38} />);
    expect(screen.getByText("38 · Fair")).toBeInTheDocument();
  });

  it("falls back to 'No data' for null", () => {
    renderWithIntl(<EaqiBadge value={null} />);
    expect(screen.getByText(/No data/)).toBeInTheDocument();
  });

  it("translates the label per locale", () => {
    renderWithIntl(<EaqiBadge value={38} />, { locale: "ru" });
    expect(screen.getByText("38 · Приемлемо")).toBeInTheDocument();
  });
});
