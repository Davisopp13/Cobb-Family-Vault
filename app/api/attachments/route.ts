import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { attachments, entries } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { entryId, filename, storagePath, mimeType, sizeBytes } = body as {
    entryId: string;
    filename: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
  };

  if (!entryId || !filename || !storagePath || !mimeType || !sizeBytes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

  const id = generateId();
  await db.insert(attachments).values({
    id,
    entryId,
    familyId: user.familyId,
    filename,
    storagePath,
    mimeType,
    sizeBytes,
    uploadedBy: user.id,
  });

  const [attachment] = await db
    .select()
    .from(attachments)
    .where(eq(attachments.id, id))
    .limit(1);

  return NextResponse.json({ attachment });
}
