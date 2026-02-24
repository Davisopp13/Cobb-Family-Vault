import Link from "next/link";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { entries, sections } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { formatRelativeTime, truncate } from "@/lib/utils";

export default async function DashboardPage() {
  const { user } = await validateRequest();
  if (!user) return null;

  // Get all sections with entry counts
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.familyId, user.familyId))
    .orderBy(sections.sortOrder);

  // Get entry counts per section
  const entryCounts = await db
    .select({
      sectionId: entries.sectionId,
      count: count(entries.id),
    })
    .from(entries)
    .where(
      and(
        eq(entries.familyId, user.familyId),
        isNull(entries.deletedAt)
      )
    )
    .groupBy(entries.sectionId);

  const countMap = new Map(entryCounts.map((e) => [e.sectionId, e.count]));

  // Get most recent entry per section
  const recentEntries = await db
    .select({
      id: entries.id,
      title: entries.title,
      sectionId: entries.sectionId,
      isSensitive: entries.isSensitive,
      updatedAt: entries.updatedAt,
    })
    .from(entries)
    .where(
      and(
        eq(entries.familyId, user.familyId),
        isNull(entries.deletedAt)
      )
    )
    .orderBy(desc(entries.updatedAt))
    .limit(50);

  const recentMap = new Map<string, typeof recentEntries[0]>();
  for (const entry of recentEntries) {
    if (!recentMap.has(entry.sectionId)) {
      recentMap.set(entry.sectionId, entry);
    }
  }

  const sectionsWithContent = allSections.filter(
    (s) => (countMap.get(s.id) ?? 0) > 0
  );

  const completionPct = Math.round(
    (sectionsWithContent.length / allSections.length) * 100
  );

  const recentlyUpdated = recentEntries.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Family Vault
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Everything your family needs, organized in one place.
          </p>
        </div>
        <Link
          href="/entry/new"
          className="inline-flex items-center gap-2 bg-[#1e3a2f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162b23] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </Link>
      </div>

      {/* Completion tracker */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-stone-700">
            Vault Completeness
          </p>
          <span className="text-sm font-bold text-[#1e3a2f]">
            {sectionsWithContent.length} of {allSections.length} sections
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#1e3a2f] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 mt-1.5">
          {completionPct === 100
            ? "🎉 Your vault is complete! Review entries regularly."
            : `${allSections.length - sectionsWithContent.length} sections still need information.`}
        </p>
      </div>

      {/* Search bar */}
      <Link
        href="/dashboard/search"
        className="flex items-center gap-2 w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-stone-400 text-sm shadow-sm hover:border-stone-300 transition-colors"
      >
        <Search className="w-4 h-4" />
        Search all entries…
      </Link>

      {/* Section grid */}
      <div>
        <h2 className="text-base font-semibold text-stone-700 mb-3">
          All Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allSections.map((section) => {
            const entryCount = countMap.get(section.id) ?? 0;
            const mostRecent = recentMap.get(section.id);
            const hasContent = entryCount > 0;

            return (
              <Link
                key={section.id}
                href={`/section/${section.id}`}
                className="group bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md hover:border-stone-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <h3 className="font-semibold text-stone-800 text-sm leading-tight group-hover:text-[#1e3a2f] transition-colors">
                        {section.name}
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {entryCount === 0
                          ? "No entries yet"
                          : `${entryCount} entr${entryCount === 1 ? "y" : "ies"}`}
                      </p>
                    </div>
                  </div>
                  {!hasContent && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Empty
                    </span>
                  )}
                  {hasContent && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      ✓
                    </span>
                  )}
                </div>

                {mostRecent ? (
                  <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                    {mostRecent.isSensitive
                      ? "🔒 Sensitive — tap to view"
                      : truncate(mostRecent.title, 60)}
                    {" · "}
                    {formatRelativeTime(mostRecent.updatedAt)}
                  </p>
                ) : (
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed italic">
                    {truncate(section.description ?? "", 80)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recently updated */}
      {recentlyUpdated.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-stone-700 mb-3">
            Recently Updated
          </h2>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
            {recentlyUpdated.map((entry) => {
              const section = allSections.find(
                (s) => s.id === entry.sectionId
              );
              return (
                <Link
                  key={entry.id}
                  href={`/entry/${entry.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">
                    {section?.icon ?? "📋"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {entry.isSensitive ? "🔒 Sensitive entry" : entry.title}
                    </p>
                    <p className="text-xs text-stone-400">
                      {section?.name} · {formatRelativeTime(entry.updatedAt)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
