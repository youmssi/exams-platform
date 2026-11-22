import { describe, expect, it } from "vitest";
import { publishAtFor, requestVisibility } from "./visibility";

const now = new Date("2026-12-01T08:00:00Z");

describe("request visibility", () => {
  it("is scheduled until registrations open", () => {
    const opens = new Date("2026-12-02T08:00:00Z");
    expect(publishAtFor(opens, now)).toEqual(opens);
    expect(requestVisibility(opens, now)).toBe("scheduled");
  });

  it("is published at once when registrations are already open", () => {
    const opened = new Date("2026-11-30T08:00:00Z");
    expect(publishAtFor(opened, now)).toEqual(now);
    expect(requestVisibility(now, now)).toBe("published");
  });
});
