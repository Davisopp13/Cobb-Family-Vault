"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { invites, sections, users } from "../schema";
import { validateRequest } from "../session";
import { generateId, generateToken } from "../utils";

export async function createInvite(formData: FormData) {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  // Check not already a member
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existingUser) {
    return { error: "This email is already registered" };
  }

  // Check for pending invite
  const existingInvites = await db
    .select()
    .from(invites)
    .where(eq(invites.email, email.toLowerCase()));

  const pendingInvite = existingInvites.find((i) => i.status === "pending");
  if (pendingInvite) {
    // Return existing token
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return { token: pendingInvite.token, url: `${origin}/invite/${pendingInvite.token}` };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(invites).values({
    id: generateId(),
    familyId: user.familyId,
    email: email.toLowerCase(),
    token,
    invitedBy: user.id,
    expiresAt,
  });

  revalidatePath("/admin/members");
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return { token, url: `${origin}/invite/${token}` };
}

export async function revokeInvite(inviteId: string) {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  await db
    .update(invites)
    .set({ status: "expired" })
    .where(eq(invites.id, inviteId));

  revalidatePath("/admin/members");
}

export async function removeMember(memberId: string) {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };
  if (memberId === user.id) return { error: "Cannot remove yourself" };

  // We don't actually delete users — just invalidate their sessions
  // For V1 we'll just mark them somehow. Instead, delete the user.
  await db.delete(users).where(eq(users.id, memberId));

  revalidatePath("/admin/members");
}

export async function updateMemberRole(memberId: string, role: "admin" | "member") {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  await db.update(users).set({ role }).where(eq(users.id, memberId));

  revalidatePath("/admin/members");
}

export async function reorderSection(sectionId: string, direction: "up" | "down") {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.familyId, user.familyId))
    .orderBy(sections.sortOrder);

  const idx = allSections.findIndex((s) => s.id === sectionId);
  if (idx === -1) return { error: "Section not found" };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= allSections.length) return;

  const a = allSections[idx];
  const b = allSections[swapIdx];

  await db
    .update(sections)
    .set({ sortOrder: b.sortOrder })
    .where(eq(sections.id, a.id));

  await db
    .update(sections)
    .set({ sortOrder: a.sortOrder })
    .where(eq(sections.id, b.id));

  revalidatePath("/admin/sections");
  revalidatePath("/dashboard");
}

export async function createCustomSection(formData: FormData) {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;

  if (!name) return { error: "Section name is required" };

  // Get max sort order
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.familyId, user.familyId));

  const maxOrder = Math.max(...allSections.map((s) => s.sortOrder), 0);

  await db.insert(sections).values({
    id: generateId(),
    familyId: user.familyId,
    name,
    description,
    icon: icon || "📁",
    sortOrder: maxOrder + 1,
    isDefault: false,
  });

  revalidatePath("/admin/sections");
  revalidatePath("/dashboard");
}

export async function updateSectionName(sectionId: string, formData: FormData) {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;

  if (!name) return { error: "Name is required" };

  await db
    .update(sections)
    .set({ name, description, icon })
    .where(eq(sections.id, sectionId));

  revalidatePath("/admin/sections");
  revalidatePath("/dashboard");
}
