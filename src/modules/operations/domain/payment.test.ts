import { describe, expect, it } from "vitest";
import {
  amountDue,
  isSettled,
  paymentDeadline,
  paymentReference,
  paymentsFor,
} from "./payment";

describe("payments", () => {
  it("splits the frozen price into the assistant's share and the commission", () => {
    expect(paymentsFor({ assistantShare: 2700, commission: 300 })).toEqual([
      { recipient: "ASSISTANT", amount: 2700 },
      { recipient: "PLATFORM", amount: 300 },
    ]);
  });

  it("builds a short, readable reference", () => {
    expect(paymentReference("cmabc123xyz9k2")).toBe("EX-XYZ9K2");
  });

  it("gives the offer's hours to pay after the confirmation", () => {
    expect(
      paymentDeadline(24, new Date("2027-01-10T09:00:00Z")).toISOString(),
    ).toBe("2027-01-11T09:00:00.000Z");
  });

  it("closes only when every deposit is received", () => {
    expect(isSettled([])).toBe(false);
    expect(isSettled([{ status: "RECEIVED" }, { status: "DECLARED" }])).toBe(
      false,
    );
    expect(isSettled([{ status: "RECEIVED" }, { status: "RECEIVED" }])).toBe(
      true,
    );
  });

  it("sums what is still to send", () => {
    expect(
      amountDue([
        { status: "DUE", amount: 2700 },
        { status: "DECLARED", amount: 300 },
        { status: "DUE", amount: 4500 },
      ]),
    ).toBe(7200);
  });
});
