import { randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

beforeAll(() => {
  Object.assign(process.env, {
    APP_URL: "http://localhost:3000",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters!",
    EMAIL_FROM: "Exams <test@example.com>",
    CREDENTIALS_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
  });
});

describe("secret encryption", () => {
  it("round-trips and never stores the plain value", async () => {
    const { decryptSecret, encryptSecret } = await import("./crypto");
    const payload = encryptSecret("Goethe-Passw0rd!");
    expect(payload).toMatch(/^v1:/);
    expect(payload).not.toContain("Goethe");
    expect(decryptSecret(payload)).toBe("Goethe-Passw0rd!");
  });

  it("uses a new IV each time", async () => {
    const { encryptSecret } = await import("./crypto");
    expect(encryptSecret("same")).not.toBe(encryptSecret("same"));
  });

  it("rejects a tampered payload", async () => {
    const { decryptSecret, encryptSecret } = await import("./crypto");
    const [version, iv, tag, data] = encryptSecret("secret").split(":");
    const tampered = [version, iv, tag, `${data?.slice(0, -2)}AA`].join(":");
    expect(() => decryptSecret(tampered)).toThrow();
  });
});
