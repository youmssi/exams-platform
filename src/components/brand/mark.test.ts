import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LOGO_MARK_SVG } from "./mark";

describe("logo mark", () => {
  it("matches the favicon file", () => {
    const favicon = readFileSync(
      join(process.cwd(), "src/app/icon.svg"),
      "utf8",
    );
    expect(LOGO_MARK_SVG).toBe(favicon);
  });
});
