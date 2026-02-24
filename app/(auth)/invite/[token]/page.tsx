import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { invites } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import InviteForm from "./invite-form";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const { user } = await validateRequest();
  if (user) redirect("/dashboard");

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite) {
    return (
      <div className="min-h-screen bg-[#fffbf5] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-stone-800 mb-2">
            Invalid Invite Link
          </h1>
          <p className="text-stone-500 text-sm">
            This invite link is invalid or does not exist.
          </p>
        </div>
      </div>
    );
  }

  if (invite.status !== "pending") {
    return (
      <div className="min-h-screen bg-[#fffbf5] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">
            {invite.status === "accepted" ? "✅" : "⏰"}
          </div>
          <h1 className="text-xl font-bold text-stone-800 mb-2">
            {invite.status === "accepted"
              ? "Invite Already Used"
              : "Invite Expired"}
          </h1>
          <p className="text-stone-500 text-sm">
            {invite.status === "accepted"
              ? "This invite has already been accepted. Try logging in instead."
              : "This invite link has expired. Ask for a new invite link."}
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  if (invite.expiresAt && invite.expiresAt < now) {
    return (
      <div className="min-h-screen bg-[#fffbf5] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-stone-800 mb-2">
            Invite Expired
          </h1>
          <p className="text-stone-500 text-sm">
            This invite link has expired. Ask for a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbf5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3a2f] text-white text-2xl mb-4 shadow-lg">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a2f]">
            You&apos;re Invited!
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            Create your account to access the family vault
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div className="mb-4 p-3 bg-forest-50 rounded-lg border border-forest-100">
            <p className="text-sm text-forest-700">
              Joining as:{" "}
              <span className="font-medium">{invite.email}</span>
            </p>
          </div>
          <InviteForm token={token} email={invite.email} />
        </div>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
