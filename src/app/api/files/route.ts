import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/modules/identity";
import { canAccessProof } from "@/modules/operations";
import {
  type FileKind,
  imageUploadRules,
  parseFilePath,
  readPrivateFile,
} from "@/server/storage";

type Viewer = { id: string; isAdmin: boolean };

/** Who may write or read each kind of private file. */
const ACCESS: Record<
  FileKind,
  (viewer: Viewer, ownerId: string, mode: "write" | "read") => Promise<boolean>
> = {
  proof: async (viewer, disputeId, mode) =>
    (mode === "read" && viewer.isAdmin) ||
    canAccessProof(viewer.id, disputeId, mode),
};

async function viewerOf(request: Request): Promise<Viewer | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.banned) return null;
  return {
    id: session.user.id,
    // Admin reads need a session opened with the second factor, as everywhere else.
    isAdmin:
      session.user.role === "admin" && Boolean(session.session.secondFactorAt),
  };
}

const allowed = async (
  viewer: Viewer | null,
  path: string,
  mode: "write" | "read",
) => {
  const file = parseFilePath(path);
  return Boolean(
    viewer && file && (await ACCESS[file.kind](viewer, file.ownerId, mode)),
  );
};

/** Issues a one-time upload token for a path the user may write (images only, size-limited). */
export async function POST(request: Request) {
  const viewer = await viewerOf(request);
  const body = (await request.json()) as HandleUploadBody;
  try {
    return NextResponse.json(
      await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (path) => {
          if (!(await allowed(viewer, path, "write")))
            throw new Error("forbidden");
          return imageUploadRules;
        },
      }),
    );
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
}

/** Streams a private file to the people allowed to see it; never cached. */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!(await allowed(await viewerOf(request), path, "read")))
    return new NextResponse(null, { status: 404 });
  const file = await readPrivateFile(path);
  if (file?.statusCode !== 200) return new NextResponse(null, { status: 404 });
  return new NextResponse(file.stream, {
    headers: {
      "Content-Type": file.blob.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
