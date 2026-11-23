import { describe, expect, it } from "vitest";
import { extractExamDates, pageText } from "./dates";

const today = "2027-01-01";

describe("extractExamDates", () => {
  it("reads numeric dates after the level", () => {
    const text =
      "Goethe-Zertifikat B1 : examen le 15.03.2027, inscriptions dès le 01/02/2027";
    expect(extractExamDates(text, "B1", today)).toEqual([
      "2027-02-01",
      "2027-03-15",
    ]);
  });

  it("reads French, German and English month names", () => {
    expect(extractExamDates("B2 — 12 avril 2027", "B2", today)).toEqual([
      "2027-04-12",
    ]);
    expect(extractExamDates("B2 Prüfung am 3. März 2027", "B2", today)).toEqual(
      ["2027-03-03"],
    );
    expect(extractExamDates("B2 exam: June 7, 2027", "B2", today)).toEqual([
      "2027-06-07",
    ]);
  });

  it("keeps only the dates that belong to the level", () => {
    const text = "B1 : 15.03.2027 · B2 : 22.03.2027";
    expect(extractExamDates(text, "B1", today)).toEqual(["2027-03-15"]);
    expect(extractExamDates(text, "B2", today)).toEqual(["2027-03-22"]);
  });

  it("ignores past and impossible dates", () => {
    expect(
      extractExamDates("B1 : 15.03.2026 et 31.02.2027", "B1", today),
    ).toEqual([]);
  });
});

describe("pageText", () => {
  it("drops tags, scripts and entities", () => {
    expect(
      pageText(
        "<p>B1&nbsp;<b>15.03.2027</b></p><script>var x='B1 01.01.2028'</script>",
      )
        .replace(/\s+/g, " ")
        .trim(),
    ).toBe("B1 15.03.2027");
  });
});
