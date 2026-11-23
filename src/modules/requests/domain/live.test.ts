import { describe, expect, it } from "vitest";
import { requestedFor } from "./live";

const request = (sessionId: string, beneficiaryId: string, status: string) => ({
  sessionId,
  beneficiaryId,
  status,
});

describe("requestedFor", () => {
  it("counts open and booked requests of the session only", () => {
    const requests = [
      request("s1", "a", "OPEN"),
      request("s1", "b", "BOOKED"),
      request("s1", "c", "CANCELLED"),
      request("s1", "d", "ELSEWHERE"),
      request("s2", "e", "OPEN"),
    ];
    expect([...requestedFor(requests, "s1")]).toEqual(["a", "b"]);
  });
});
