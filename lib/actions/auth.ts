"use server";

import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "../auth";
import { db } from "../db";
import { families, invites, sessions, users } from "../schema";
import { seedDefaultSections } from "../seed";
import { generateId } from "../utils";

export async function setupFamily(formData: FormData) {
  const familyName = formData.get("familyName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  if (!familyName || !email || !password || !displayName) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  // Check no users exist
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    return { error: "Setup already completed" };
  }

  const familyId = generateId();
  const userId = generateId();
  const hashedPassword = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // Create family
  await db.insert(families).values({
    id: familyId,
    name: familyName,
    createdBy: userId,
  });

  // Create admin user
  await db.insert(users).values({
    id: userId,
    email,
    hashedPassword,
    displayName,
    role: "admin",
    familyId,
  });

  // Seed default sections
  await seedDefaultSections(familyId);

  // Create session
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const validPassword = await verify(user.hashedPassword, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!validPassword) {
    return { error: "Invalid email or password" };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value;

  if (sessionId) {
    await lucia.invalidateSession(sessionId);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  redirect("/login");
}

export async function acceptInvite(token: string, formData: FormData) {
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  if (!password || !displayName) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  // Validate invite
  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite) {
    return { error: "Invalid invite link" };
  }

  if (invite.status !== "pending") {
    return { error: "This invite has already been used or expired" };
  }

  const now = new Date();
  if (invite.expiresAt && invite.expiresAt < now) {
    await db
      .update(invites)
      .set({ status: "expired" })
      .where(eq(invites.id, invite.id));
    return { error: "This invite link has expired" };
  }

  // Check if email already registered
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, invite.email.toLowerCase()))
    .limit(1);

  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  const userId = generateId();
  const hashedPassword = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  await db.insert(users).values({
    id: userId,
    email: invite.email.toLowerCase(),
    hashedPassword,
    displayName,
    role: "member",
    familyId: invite.familyId,
  });

  await db
    .update(invites)
    .set({ status: "accepted" })
    .where(eq(invites.id, invite.id));

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/dashboard");
}

export async function invalidateAllSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
