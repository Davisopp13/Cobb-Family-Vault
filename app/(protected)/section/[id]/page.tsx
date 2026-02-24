import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { Plus, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { entries, sections, users } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { DEFAULT_SECTIONS } from "@/lib/seed";

interface SectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { id } = await params;
  const { user } = await validateRequest();
  if (!user) return null;

  const [section] = await db
    .select()
    .from(sections)
    .where(and(eq(sections.id, id), eq(sections.familyId, user.familyId)))
    .limit(1);

  if (!section) notFound();

  const sectionEntries = await db
    .select({
      id: entries.id,
      title: entries.title,
      content: entries.content,
      isSensitive: entries.isSensitive,
      createdAt: entries.createdAt,
      updatedAt: entries.updatedAt,
      createdBy: entries.createdBy,
      authorName: users.displayName,
    })
    .from(entries)
    .leftJoin(users, eq(entries.createdBy, users.id))
    .where(
      and(
        eq(entries.sectionId, id),
        eq(entries.familyId, user.familyId),
        isNull(entries.deletedAt)
      )
    )
    .orderBy(desc(entries.updatedAt));

  // Find empty state prompt from default sections
  const defaultSection = DEFAULT_SECTIONS.find(
    (s) => s.name === section.name
  );

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-stone-400">
        <Link href="/dashboard" className="hover:text-stone-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-700 font-medium">{section.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{section.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-stone-900">{section.name}</h1>
            {section.description && (
              <p className="text-sm text-stone-500 mt-0.5 max-w-prose">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/entry/new?section=${section.id}`}
          className="flex-shrink-0 inline-flex items-center gap-1.5 bg-[#1e3a2f] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#162b23] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </Link>
      </div>

      {/* Entries */}
      {sectionEntries.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center shadow-sm">
          <div className="text-4xl mb-3">{section.icon}</div>
          <h3 className="font-semibold text-stone-700 mb-2">
            No entries yet in {section.name}
          </h3>
          {defaultSection?.emptyPrompt && (
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-5 leading-relaxed">
              {defaultSection.emptyPrompt}
            </p>
          )}
          <Link
            href={`/entry/new?section=${section.id}`}
            className="inline-flex items-center gap-1.5 bg-[#1e3a2f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162b23] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-stone-400">
            {sectionEntries.length} entr{sectionEntries.length === 1 ? "y" : "ies"} · Newest first
          </p>
          {sectionEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/entry/${entry.id}`}
              className="block bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md hover:border-stone-300 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 group-hover:text-[#1e3a2f] transition-colors">
                    {entry.isSensitive ? (
                      <span className="flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>Sensitive Entry</span>
                      </span>
                    ) : (
                      entry.title
                    )}
                  </h3>
                  {!entry.isSensitive && (
                    <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                      {truncate(entry.content, 150)}
                    </p>
                  )}
                  {entry.isSensitive && (
                    <p className="text-sm text-stone-400 mt-1 italic">
                      Click to view sensitive content
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 flex-shrink-0 mt-1 transition-colors" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <p className="text-xs text-stone-400">
                  By {entry.authorName ?? "Unknown"} · Updated{" "}
                  {formatRelativeTime(entry.updatedAt)}
                </p>
                {entry.isSensitive && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                    Sensitive
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
