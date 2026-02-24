import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { Users, Layout, Activity, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { entries, invites, sections, users } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { formatRelativeTime } from "@/lib/utils";

export default async function AdminPage() {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const [memberCount] = await db
    .select({ count: count(users.id) })
    .from(users)
    .where(eq(users.familyId, user.familyId));

  const [pendingInvites] = await db
    .select({ count: count(invites.id) })
    .from(invites)
    .where(
      and(eq(invites.familyId, user.familyId), eq(invites.status, "pending"))
    );

  const [sectionCount] = await db
    .select({ count: count(sections.id) })
    .from(sections)
    .where(eq(sections.familyId, user.familyId));

  const [entryCount] = await db
    .select({ count: count(entries.id) })
    .from(entries)
    .where(
      and(eq(entries.familyId, user.familyId), isNull(entries.deletedAt))
    );

  const recentActivity = await db
    .select({
      id: entries.id,
      title: entries.title,
      sectionId: entries.sectionId,
      updatedAt: entries.updatedAt,
      editorName: users.displayName,
    })
    .from(entries)
    .leftJoin(users, eq(entries.updatedBy, users.id))
    .where(
      and(eq(entries.familyId, user.familyId), isNull(entries.deletedAt))
    )
    .orderBy(desc(entries.updatedAt))
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Admin Panel</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Manage family members, sections, and vault activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Members", value: memberCount?.count ?? 0, icon: "👨‍👩‍👧" },
          { label: "Pending Invites", value: pendingInvites?.count ?? 0, icon: "✉️" },
          { label: "Sections", value: sectionCount?.count ?? 0, icon: "📂" },
          { label: "Total Entries", value: entryCount?.count ?? 0, icon: "📝" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-stone-900">{stat.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/members"
          className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md hover:border-stone-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#1e3a2f]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-800 text-sm">
              Family Members
            </p>
            <p className="text-xs text-stone-400">Manage access & invites</p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
        </Link>

        <Link
          href="/admin/sections"
          className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md hover:border-stone-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center">
            <Layout className="w-5 h-5 text-[#1e3a2f]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-800 text-sm">Sections</p>
            <p className="text-xs text-stone-400">Reorder & customize</p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
        </Link>

        <Link
          href="/admin/activity"
          className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md hover:border-stone-300 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#1e3a2f]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-800 text-sm">Activity Log</p>
            <p className="text-xs text-stone-400">All changes & edits</p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
        </Link>
      </div>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-stone-700 mb-3">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
            {recentActivity.map((entry) => (
              <Link
                key={entry.id}
                href={`/entry/${entry.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">
                    {entry.title}
                  </p>
                  <p className="text-xs text-stone-400">
                    by {entry.editorName ?? "Unknown"}
                  </p>
                </div>
                <span className="text-xs text-stone-400">
                  {formatRelativeTime(entry.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
