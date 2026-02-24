import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { invites, users } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import InviteButton from "./invite-button";
import MemberActions from "./member-actions";

export default async function MembersPage() {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const members = await db
    .select()
    .from(users)
    .where(eq(users.familyId, user.familyId))
    .orderBy(users.createdAt);

  const allInvites = await db
    .select()
    .from(invites)
    .where(eq(invites.familyId, user.familyId))
    .orderBy(invites.createdAt);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-stone-400">
        <Link href="/admin" className="hover:text-stone-600 transition-colors">
          Admin
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-700 font-medium">Family Members</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Family Members</h1>
        <InviteButton />
      </div>

      {/* Members list */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
          Active Members ({members.length})
        </h2>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1e3a2f] text-white flex items-center justify-center text-sm font-bold">
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {member.displayName}
                    {member.id === user.id && (
                      <span className="ml-1.5 text-xs text-stone-400">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-stone-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    member.role === "admin"
                      ? "bg-forest-100 text-forest-700"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {member.role}
                </span>
                <span className="text-xs text-stone-400 hidden sm:block">
                  Joined {formatDate(member.createdAt)}
                </span>
                {member.id !== user.id && (
                  <MemberActions
                    memberId={member.id}
                    currentRole={member.role}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invites */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
          Invites
        </h2>
        {allInvites.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 text-center">
            <p className="text-sm text-stone-400">
              No invites sent yet. Click &ldquo;Invite Member&rdquo; to add family members.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
            {allInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">
                    {invite.email}
                  </p>
                  <p className="text-xs text-stone-400">
                    Sent {formatDate(invite.createdAt)} · Expires{" "}
                    {formatDate(invite.expiresAt)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    invite.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : invite.status === "accepted"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {invite.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
