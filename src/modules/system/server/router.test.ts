import { describe, expect, it } from "vitest";
import { createCallerFactory } from "@/trpc/init";
import { systemRouter } from "./router";

describe("systemRouter", () => {
  it("reports a healthy status", async () => {
    const caller = createCallerFactory(systemRouter)({});
    await expect(caller.health()).resolves.toEqual({ status: "ok" });
  });
});
