import { describe, expect, it } from "vitest";
import { utcToZoned, zonedToUtc } from "./time-zone";

describe("time zones", () => {
  it("converts Douala wall-clock time (UTC+1, no DST)", () => {
    expect(zonedToUtc("2026-12-01T09:00", "Africa/Douala").toISOString()).toBe(
      "2026-12-01T08:00:00.000Z",
    );
  });

  it("handles daylight saving (Berlin summer UTC+2, winter UTC+1)", () => {
    expect(zonedToUtc("2026-07-01T09:00", "Europe/Berlin").toISOString()).toBe(
      "2026-07-01T07:00:00.000Z",
    );
    expect(zonedToUtc("2026-01-15T09:00", "Europe/Berlin").toISOString()).toBe(
      "2026-01-15T08:00:00.000Z",
    );
  });

  it("round-trips", () => {
    const instant = zonedToUtc("2026-03-10T23:30", "Africa/Douala");
    expect(utcToZoned(instant, "Africa/Douala")).toBe("2026-03-10T23:30");
  });
});
