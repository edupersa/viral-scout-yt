import { describe, it, expect } from "vitest";
import { buildFilterPayload } from "./filterUtils";

const base = {
  language: "",
  duration: "",
  minDuration: 0,
  maxDuration: 60,
  maxDurationLimited: false,
  minSubs: 1,
  maxSubs: 1_000_000,
  maxSubsLimited: false,
  minViews: 0,
  maxViews: 1_000_000,
  maxViewsLimited: false,
  dateRange: "",
};

describe("buildFilterPayload", () => {
  it("converts empty strings to null", () => {
    const result = buildFilterPayload(base);
    expect(result.language).toBeNull();
    expect(result.duration).toBeNull();
    expect(result.date_range).toBeNull();
  });

  it("converts minDuration from minutes to seconds", () => {
    const result = buildFilterPayload({ ...base, minDuration: 5 });
    expect(result.min_duration).toBe(300);
  });

  it("returns null for max_duration when maxDurationLimited is false", () => {
    const result = buildFilterPayload({ ...base, maxDurationLimited: false, maxDuration: 30 });
    expect(result.max_duration).toBeNull();
  });

  it("converts maxDuration to seconds when maxDurationLimited is true", () => {
    const result = buildFilterPayload({ ...base, maxDurationLimited: true, maxDuration: 10 });
    expect(result.max_duration).toBe(600);
  });

  it("returns null for max_subs when maxSubsLimited is false", () => {
    const result = buildFilterPayload({ ...base, maxSubsLimited: false, maxSubs: 500_000 });
    expect(result.max_subs).toBeNull();
  });

  it("passes max_subs when maxSubsLimited is true", () => {
    const result = buildFilterPayload({ ...base, maxSubsLimited: true, maxSubs: 50_000 });
    expect(result.max_subs).toBe(50_000);
  });

  it("passes language and date_range when set", () => {
    const result = buildFilterPayload({ ...base, language: "es", dateRange: "30d" });
    expect(result.language).toBe("es");
    expect(result.date_range).toBe("30d");
  });
});
