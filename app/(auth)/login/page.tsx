import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/session";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#fffbf5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3a2f] text-white text-2xl mb-4 shadow-lg">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a2f]">
            Cobb Family Vault
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            Sign in to access the family vault
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Only family members with access can sign in.
          <br />
          Ask Lance for an invite link.
        </p>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
