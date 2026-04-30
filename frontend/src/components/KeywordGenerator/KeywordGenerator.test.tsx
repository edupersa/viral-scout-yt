import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeywordGenerator } from "./KeywordGenerator";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("KeywordGenerator", () => {
  it("renders niche input and generate button", () => {
    render(<KeywordGenerator onComplete={vi.fn()} />, { wrapper });
    expect(screen.getByPlaceholderText(/personal finance/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /generate keywords/i })).toBeDefined();
  });

  it("generate button is disabled when niche is too short", () => {
    render(<KeywordGenerator onComplete={vi.fn()} />, { wrapper });
    const btn = screen.getByRole("button", { name: /generate keywords/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it("generate button enables after typing valid niche", async () => {
    const user = userEvent.setup();
    render(<KeywordGenerator onComplete={vi.fn()} />, { wrapper });
    const textarea = screen.getByPlaceholderText(/personal finance/i);
    await user.type(textarea, "home workout routines");
    const btn = screen.getByRole("button", { name: /generate keywords/i });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });
});
