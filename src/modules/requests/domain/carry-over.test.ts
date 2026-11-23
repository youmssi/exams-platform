import { describe, expect, it } from "vitest";
import {
  autoCarryTarget,
  carriedBonus,
  isPastSession,
  laterSessions,
} from "./carry-over";

const now = new Date("2027-03-16T09:00:00Z");
const day = (date: string) => new Date(`${date}T00:00:00Z`);
const session = (id: string, date: string, verified: boolean) => ({
  id,
  examDate: day(date),
  verifiedAt: verified ? day("2027-01-01") : null,
});

describe("carry-over", () => {
  it("treats the exam day itself as not past", () => {
    expect(isPastSession(day("2027-03-16"), now)).toBe(false);
    expect(isPastSession(day("2027-03-15"), now)).toBe(true);
  });

  it("lists later sessions still to come, soonest first", () => {
    const sessions = [
      session("may", "2027-05-10", false),
      session("apr", "2027-04-12", true),
      session("old", "2027-03-01", true),
    ];
    expect(
      laterSessions(sessions, day("2027-03-15"), now).map(({ id }) => id),
    ).toEqual(["apr", "may"]);
  });

  it("carries automatically to the first confirmed session only", () => {
    const sessions = [
      session("apr", "2027-04-12", false),
      session("may", "2027-05-10", true),
    ];
    expect(autoCarryTarget(sessions, day("2027-03-15"), now)?.id).toBe("may");
    expect(
      autoCarryTarget(
        [session("apr", "2027-04-12", false)],
        day("2027-03-15"),
        now,
      ),
    ).toBeNull();
  });

  it("keeps the bonus within the offer's current rules", () => {
    expect(carriedBonus(1500, { bonusStep: 500, bonusCap: 3000 })).toBe(1500);
    expect(carriedBonus(1500, { bonusStep: 1000, bonusCap: 3000 })).toBe(1000);
    expect(carriedBonus(3000, { bonusStep: 500, bonusCap: 2000 })).toBe(2000);
  });
});
