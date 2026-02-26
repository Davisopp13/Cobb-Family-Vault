import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { entries } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { getUploadUrl } from "@/lib/r2";
import { generateId } from "@/lib/utils";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
]);

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { filename, contentType, entryId } = body as {
    filename: string;
    contentType: string;
    entryId: string;
  };

  if (!filename || !contentType || !entryId) {
    return NextResponse.json(
      { error: "filename, contentType, and entryId are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  // Verify entry belongs to user's family
  const [entry] = await db
    .select({ id: entries.id })
    .from(entries)
    .where(
      and(
        eq(entries.id, entryId),
        eq(entries.familyId, user.familyId),
        isNull(entries.deletedAt)
      )
    )
    .limit(1);

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.familyId}/${entryId}/${generateId()}-${safeFilename}`;

  const uploadUrl = await getUploadUrl(storagePath, contentType);

  return NextResponse.json({ uploadUrl, storagePath });
}
