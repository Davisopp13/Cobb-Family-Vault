import { and, eq, isNull, like, or } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { entries, sections } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { formatRelativeTime, truncate } from "@/lib/utils";
import SearchInput from "./search-input";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const { user } = await validateRequest();
  if (!user) return null;

  let results: {
    id: string;
    title: string;
    content: string;
    isSensitive: boolean;
    updatedAt: Date | null;
    sectionName: string | null;
    sectionIcon: string | null;
    sectionId: string;
  }[] = [];

  if (q && q.trim().length >= 2) {
    const searchTerm = `%${q.trim()}%`;
    results = await db
      .select({
        id: entries.id,
        title: entries.title,
        content: entries.content,
        isSensitive: entries.isSensitive,
        updatedAt: entries.updatedAt,
        sectionName: sections.name,
        sectionIcon: sections.icon,
        sectionId: entries.sectionId,
      })
      .from(entries)
      .leftJoin(sections, eq(entries.sectionId, sections.id))
      .where(
        and(
          eq(entries.familyId, user.familyId),
          isNull(entries.deletedAt),
          or(
            like(entries.title, searchTerm),
            like(entries.content, searchTerm)
          )
        )
      )
      .limit(50);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-stone-400">
        <Link
          href="/dashboard"
          className="hover:text-stone-600 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-700 font-medium">Search</span>
      </nav>

      <h1 className="text-xl font-bold text-stone-900">Search Entries</h1>

      <SearchInput defaultValue={q} />

      {q && q.trim().length >= 2 && (
        <p className="text-sm text-stone-400">
          {results.length === 0
            ? `No results for "${q}"`
            : `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"`}
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((entry) => (
            <Link
              key={entry.id}
              href={`/entry/${entry.id}`}
              className="block bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow-md hover:border-stone-300 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">
                      {entry.sectionIcon ?? "📋"}
                    </span>
                    <span className="text-xs text-stone-400">
                      {entry.sectionName}
                    </span>
                  </div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-[#1e3a2f] transition-colors">
                    {entry.isSensitive ? "🔒 Sensitive Entry" : entry.title}
                  </h3>
                  {!entry.isSensitive && (
                    <p className="text-sm text-stone-500 mt-1">
                      {truncate(entry.content, 120)}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 flex-shrink-0 mt-1 transition-colors" />
              </div>
              <p className="text-xs text-stone-400 mt-2">
                Updated {formatRelativeTime(entry.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}

      {!q && (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center shadow-sm">
          <div className="text-3xl mb-3">🔍</div>
          <p className="text-stone-400 text-sm">
            Type to search across all entries in your vault
          </p>
        </div>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
