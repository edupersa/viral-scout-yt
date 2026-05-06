import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { KeywordPill } from "./KeywordPill";

describe("KeywordPill", () => {
  it("renders the keyword text", () => {
    render(<KeywordPill keyword="budgeting tips" selected={false} onToggle={vi.fn()} />);
    expect(screen.getByRole("button", { name: /budgeting tips/i })).toBeTruthy();
  });

  it("has aria-pressed=false when not selected", () => {
    render(<KeywordPill keyword="test" selected={false} onToggle={vi.fn()} />);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
  });

  it("has aria-pressed=true when selected", () => {
    render(<KeywordPill keyword="test" selected={true} onToggle={vi.fn()} />);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  });

  it("calls onToggle with the keyword when clicked", async () => {
    const handler = vi.fn();
    render(<KeywordPill keyword="budgeting tips" selected={false} onToggle={handler} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledWith("budgeting tips");
  });
});
