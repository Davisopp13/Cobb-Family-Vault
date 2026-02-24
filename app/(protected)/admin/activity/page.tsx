import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { entries, sections, users } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default async function ActivityPage() {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const activity = await db
    .select({
      id: entries.id,
      title: entries.title,
      isSensitive: entries.isSensitive,
      sectionId: entries.sectionId,
      sectionName: sections.name,
      sectionIcon: sections.icon,
      createdAt: entries.createdAt,
      updatedAt: entries.updatedAt,
      authorName: users.displayName,
    })
    .from(entries)
    .leftJoin(users, eq(entries.updatedBy, users.id))
    .leftJoin(sections, eq(entries.sectionId, sections.id))
    .where(
      and(eq(entries.familyId, user.familyId), isNull(entries.deletedAt))
    )
    .orderBy(desc(entries.updatedAt))
    .limit(100);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-stone-400">
        <Link href="/admin" className="hover:text-stone-600 transition-colors">
          Admin
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-700 font-medium">Activity Log</span>
      </nav>

      <h1 className="text-2xl font-bold text-stone-900">Activity Log</h1>

      {activity.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center shadow-sm">
          <p className="text-stone-400">No activity yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
          {activity.map((entry) => (
            <Link
              key={entry.id}
              href={`/entry/${entry.id}`}
              className="flex items-center gap-4 px-4 py-4 hover:bg-stone-50 transition-colors"
            >
              <div className="w-8 h-8 flex items-center justify-center text-xl flex-shrink-0">
                {entry.sectionIcon ?? "📋"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">
                  {entry.isSensitive ? "🔒 Sensitive entry" : entry.title}
                </p>
                <p className="text-xs text-stone-400">
                  {entry.sectionName} · by {entry.authorName ?? "Unknown"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-stone-500">
                  {formatRelativeTime(entry.updatedAt)}
                </p>
                <p className="text-xs text-stone-300">
                  {formatDate(entry.updatedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
