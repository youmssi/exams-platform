import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";
import { env } from "./env";

/**
 * AES-256-GCM for third-party secrets (exam-centre passwords).
 * Format: `v1:<iv>:<tag>:<ciphertext>` in base64url. The version prefix allows key rotation.
 */
const VERSION = "v1";
const key = () => Buffer.from(env.CREDENTIALS_ENCRYPTION_KEY, "base64");

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [VERSION, iv, cipher.getAuthTag(), data]
    .map((part) =>
      typeof part === "string" ? part : part.toString("base64url"),
    )
    .join(":");
}

export function decryptSecret(payload: string): string {
  const [version, iv, tag, data] = payload.split(":");
  if (version !== VERSION || !iv || !tag || !data)
    throw new Error("Unsupported secret format");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** A stable public identifier for a user (e.g. `U-4F9K2Q`): shown instead of any name. */
export const publicId = (userId: string) =>
  `U-${createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(`public:${userId}`)
    .digest("base64url")
    .replace(/[-_]/g, "")
    .slice(0, 6)
    .toUpperCase()}`;
