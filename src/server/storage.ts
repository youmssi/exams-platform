import "server-only";
import { get, head } from "@vercel/blob";
import { trustConfig } from "@/config/trust";

/**
 * Private files (dispute proofs) on Vercel Blob, never public.
 * A path is `<kind>/<ownerId>/<name>`: the owner is what the file belongs to (e.g. the dispute),
 * so access rules are checked from the path alone.
 */
export const FILE_KINDS = ["proof"] as const;
export type FileKind = (typeof FILE_KINDS)[number];

export function parseFilePath(path: string) {
  const [kind, ownerId, name, ...rest] = path.split("/");
  if (
    !FILE_KINDS.includes(kind as FileKind) ||
    !ownerId ||
    !name ||
    rest.length
  )
    return null;
  return { kind: kind as FileKind, ownerId };
}

/** Upload rules shared by every private image. */
export const imageUploadRules = {
  allowedContentTypes: [...trustConfig.imageTypes],
  maximumSizeInBytes: trustConfig.imageMaxBytes,
  addRandomSuffix: true,
};

/** Whether an uploaded file exists and is an image within the size limit. */
export async function isValidImage(path: string) {
  const blob = await head(path).catch(() => null);
  return Boolean(
    blob &&
      blob.size <= trustConfig.imageMaxBytes &&
      (trustConfig.imageTypes as readonly string[]).includes(blob.contentType),
  );
}

/** Where the app serves a private file, after checking who asks (`/api/files`). */
export const fileUrl = (path: string) =>
  `/api/files?path=${encodeURIComponent(path)}`;

export const readPrivateFile = (path: string) =>
  get(path, { access: "private" });
