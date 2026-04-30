import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FilterPanel } from "./FilterPanel";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("FilterPanel", () => {
  it("renders filter controls", () => {
    render(
      <FilterPanel niche="fitness" selectedKeywords={["gym"]} onResults={vi.fn()} />,
      { wrapper },
    );
    expect(screen.getByText("Language")).toBeDefined();
    expect(screen.getByText("Duration")).toBeDefined();
    expect(screen.getByText("Date Range")).toBeDefined();
  });

  it("renders search button", () => {
    render(
      <FilterPanel niche="fitness" selectedKeywords={["gym"]} onResults={vi.fn()} />,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: /search videos/i })).toBeDefined();
  });

  it("language select updates on change", async () => {
    const user = userEvent.setup();
    render(
      <FilterPanel niche="fitness" selectedKeywords={["gym"]} onResults={vi.fn()} />,
      { wrapper },
    );
    const langSelect = screen.getByDisplayValue("Any language");
    await user.selectOptions(langSelect, "en");
    expect((langSelect as HTMLSelectElement).value).toBe("en");
  });
});
