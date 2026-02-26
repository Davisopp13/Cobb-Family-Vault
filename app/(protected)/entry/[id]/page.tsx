import Link from "next/link";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { ChevronRight, Edit, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { attachments, entries, entryHistory, sections, users } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import EntryContent from "./entry-content";
import DeleteEntryButton from "./delete-button";
import EntryAttachments from "@/components/entries/entry-attachments";

interface EntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EntryPage({ params }: EntryPageProps) {
  const { id } = await params;
  const { user } = await validateRequest();
  if (!user) return null;

  const [entry] = await db
    .select({
      id: entries.id,
      title: entries.title,
      content: entries.content,
      isSensitive: entries.isSensitive,
      sectionId: entries.sectionId,
      createdAt: entries.createdAt,
      updatedAt: entries.updatedAt,
      createdBy: entries.createdBy,
      updatedBy: entries.updatedBy,
      authorName: users.displayName,
    })
    .from(entries)
    .leftJoin(users, eq(entries.createdBy, users.id))
    .where(
      and(
        eq(entries.id, id),
        eq(entries.familyId, user.familyId),
        isNull(entries.deletedAt)
      )
    )
    .limit(1);

  if (!entry) notFound();

  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, entry.sectionId))
    .limit(1);

  // Get edit history
  const history = await db
    .select({
      id: entryHistory.id,
      title: entryHistory.title,
      editedAt: entryHistory.editedAt,
      editorName: users.displayName,
    })
    .from(entryHistory)
    .leftJoin(users, eq(entryHistory.editedBy, users.id))
    .where(eq(entryHistory.entryId, id))
    .orderBy(desc(entryHistory.editedAt))
    .limit(20);

  // Get attachments
  const entryAttachments = await db
    .select()
    .from(attachments)
    .where(eq(attachments.entryId, id))
    .orderBy(asc(attachments.createdAt));

  // Get updater name
  let updaterName: string | null = null;
  if (entry.updatedBy && entry.updatedBy !== entry.createdBy) {
    const [updater] = await db
      .select({ displayName: users.displayName })
      .from(users)
      .where(eq(users.id, entry.updatedBy))
      .limit(1);
    updaterName = updater?.displayName ?? null;
  }

  const canEdit = user.role === "admin" || entry.createdBy === user.id;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-stone-400">
        <Link href="/dashboard" className="hover:text-stone-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {section && (
          <>
            <Link
              href={`/section/${section.id}`}
              className="hover:text-stone-600 transition-colors"
            >
              {section.icon} {section.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-stone-700 font-medium truncate max-w-[200px]">
          {entry.isSensitive ? "Sensitive Entry" : entry.title}
        </span>
      </nav>

      {/* Entry card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-stone-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              {entry.isSensitive && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium mb-2">
                  🔒 Sensitive
                </span>
              )}
              <h1 className="text-xl font-bold text-stone-900">
                {entry.isSensitive ? "Sensitive Entry" : entry.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {canEdit && (
                <Link
                  href={`/entry/${entry.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Link>
              )}
              {user.role === "admin" && (
                <DeleteEntryButton entryId={entry.id} />
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
            <span>
              Created by {entry.authorName ?? "Unknown"} on{" "}
              {formatDate(entry.createdAt)}
            </span>
            {entry.updatedAt &&
              entry.updatedAt !== entry.createdAt && (
                <span>
                  Last edited{" "}
                  {updaterName ? `by ${updaterName} ` : ""}
                  {formatRelativeTime(entry.updatedAt)}
                </span>
              )}
          </div>
        </div>

        {/* Content */}
        <EntryContent
          content={entry.content}
          title={entry.title}
          isSensitive={entry.isSensitive}
        />
      </div>

      {/* Attachments */}
      <EntryAttachments
        entryId={entry.id}
        initialAttachments={entryAttachments}
        currentUserId={user.id}
        isAdmin={user.role === "admin"}
      />

      {/* Edit history */}
      {history.length > 0 && (
        <details className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden group">
          <summary className="px-5 py-4 flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors list-none">
            <Clock className="w-4 h-4 text-stone-400" />
            Edit History ({history.length} revision{history.length === 1 ? "" : "s"})
            <span className="ml-auto text-stone-400 group-open:rotate-180 transition-transform inline-block">
              ▼
            </span>
          </summary>
          <div className="border-t border-stone-100 divide-y divide-stone-100">
            {history.map((h) => (
              <div key={h.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-700 font-medium">
                    &ldquo;{h.title}&rdquo;
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Edited by {h.editorName ?? "Unknown"}
                  </p>
                </div>
                <span className="text-xs text-stone-400">
                  {formatRelativeTime(h.editedAt)}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
