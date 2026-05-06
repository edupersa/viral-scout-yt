import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeTruthy();
  });

  it("calls onClick when clicked", async () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Go</Button>);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("is disabled and shows spinner when isLoading", () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole("button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.querySelector("svg")).toBeTruthy();
  });

  it("does not call onClick when disabled", async () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).not.toHaveBeenCalled();
  });
});
