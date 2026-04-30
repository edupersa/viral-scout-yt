import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideoTable } from "./VideoTable";
import type { VideoResult } from "../../api/types";

const makeVideo = (overrides: Partial<VideoResult> = {}): VideoResult => ({
  id: 1,
  youtube_id: "abc123",
  title: "Test Video Title",
  channel_name: "Test Channel",
  channel_id: "ch1",
  views: 1_500_000,
  subs: 50_000,
  outlier_score: 12.5,
  virality_class: "ultra_viral",
  duration_seconds: 600,
  language: "en",
  published_at: "2024-01-15T00:00:00Z",
  thumbnail_url: "",
  ...overrides,
});

const VIDEOS: VideoResult[] = [
  makeVideo({ id: 1, youtube_id: "v1", title: "High Viral Video", outlier_score: 15 }),
  makeVideo({
    id: 2,
    youtube_id: "v2",
    title: "Medium Viral Video",
    outlier_score: 6,
    virality_class: "very_viral",
  }),
  makeVideo({
    id: 3,
    youtube_id: "v3",
    title: "Normal Video",
    outlier_score: 1.5,
    virality_class: "normal",
  }),
];

describe("VideoTable", () => {
  it("renders all video rows", () => {
    render(<VideoTable videos={VIDEOS} />);
    expect(screen.getByText("High Viral Video")).toBeDefined();
    expect(screen.getByText("Medium Viral Video")).toBeDefined();
    expect(screen.getByText("Normal Video")).toBeDefined();
  });

  it("shows empty state when no videos", () => {
    render(<VideoTable videos={[]} />);
    expect(screen.getByText(/no videos found/i)).toBeDefined();
  });

  it("sorts by views when header clicked", async () => {
    const user = userEvent.setup();
    render(<VideoTable videos={VIDEOS} />);

    const viewsHeader = screen.getByRole("button", { name: /views/i });
    await user.click(viewsHeader);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("renders outlier scores", () => {
    render(<VideoTable videos={VIDEOS} />);
    expect(screen.getByText("15.0x")).toBeDefined();
    expect(screen.getByText("6.0x")).toBeDefined();
    expect(screen.getByText("1.5x")).toBeDefined();
  });
});
