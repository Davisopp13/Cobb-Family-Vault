"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../db";
import { entries, entryHistory } from "../schema";
import { validateRequest } from "../session";
import { generateId } from "../utils";

export async function createEntry(formData: FormData) {
  const { user } = await validateRequest();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const sectionId = formData.get("sectionId") as string;
  const isSensitive = formData.get("isSensitive") === "true";

  if (!title || !content || !sectionId) {
    return { error: "Title, content, and section are required" };
  }

  const entryId = generateId();

  await db.insert(entries).values({
    id: entryId,
    familyId: user.familyId,
    sectionId,
    title,
    content,
    isSensitive,
    createdBy: user.id,
    updatedBy: user.id,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/section/${sectionId}`);
  redirect(`/entry/${entryId}`);
}

export async function updateEntry(entryId: string, formData: FormData) {
  const { user } = await validateRequest();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const isSensitive = formData.get("isSensitive") === "true";

  if (!title || !content) {
    return { error: "Title and content are required" };
  }

  // Get current entry
  const [currentEntry] = await db
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.id, entryId),
        eq(entries.familyId, user.familyId),
        isNull(entries.deletedAt)
      )
    )
    .limit(1);

  if (!currentEntry) {
    return { error: "Entry not found" };
  }

  // Check permission: admin or original author
  if (user.role !== "admin" && currentEntry.createdBy !== user.id) {
    return { error: "You don't have permission to edit this entry" };
  }

  // Save to history
  await db.insert(entryHistory).values({
    id: generateId(),
    entryId,
    title: currentEntry.title,
    content: currentEntry.content,
    editedBy: user.id,
    editedAt: currentEntry.updatedAt || new Date(),
  });

  // Update entry
  const now = new Date();
  await db
    .update(entries)
    .set({
      title,
      content,
      isSensitive,
      updatedBy: user.id,
      updatedAt: now,
    })
    .where(eq(entries.id, entryId));

  revalidatePath(`/entry/${entryId}`);
  revalidatePath(`/section/${currentEntry.sectionId}`);
  revalidatePath("/dashboard");
  redirect(`/entry/${entryId}`);
}

export async function deleteEntry(entryId: string) {
  const { user } = await validateRequest();
  if (!user) return { error: "Unauthorized" };
  if (user.role !== "admin") return { error: "Only admins can delete entries" };

  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, entryId), eq(entries.familyId, user.familyId)))
    .limit(1);

  if (!entry) return { error: "Entry not found" };

  const now = new Date();
  await db
    .update(entries)
    .set({ deletedAt: now })
    .where(eq(entries.id, entryId));

  revalidatePath(`/section/${entry.sectionId}`);
  revalidatePath("/dashboard");
  redirect(`/section/${entry.sectionId}`);
}

export async function toggleSensitive(entryId: string) {
  const { user } = await validateRequest();
  if (!user) return { error: "Unauthorized" };

  const [entry] = await db
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.id, entryId),
        eq(entries.familyId, user.familyId),
        isNull(entries.deletedAt)
      )
    )
    .limit(1);

  if (!entry) return { error: "Entry not found" };

  if (user.role !== "admin" && entry.createdBy !== user.id) {
    return { error: "Permission denied" };
  }

  await db
    .update(entries)
    .set({ isSensitive: !entry.isSensitive })
    .where(eq(entries.id, entryId));

  revalidatePath(`/entry/${entryId}`);
  revalidatePath(`/section/${entry.sectionId}`);
}
