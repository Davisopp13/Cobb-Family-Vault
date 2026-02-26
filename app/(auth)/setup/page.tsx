import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import SetupForm from "./setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  // If users already exist, redirect
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#fffbf5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3a2f] mb-4 shadow-lg overflow-hidden">
            <img src="/icons/Cobb_Family_Vault.png" alt="Cobb Family Vault" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a2f]">
            Welcome to Cobb Family Vault
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            Let&apos;s get you set up. This only takes a minute.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <SetupForm />
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Everything your family needs to know, in one safe place.
        </p>
      </div>
    </div>
  );
}
