import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { validateRequest } from "@/lib/session";

export default async function Home() {
  const { user } = await validateRequest();

  if (user) {
    redirect("/dashboard");
  }

  // Check if any users exist
  const anyUsers = await db.select().from(users).limit(1);
  if (anyUsers.length === 0) {
    redirect("/setup");
  }

  redirect("/login");
}
export const dynamic = "force-dynamic";
