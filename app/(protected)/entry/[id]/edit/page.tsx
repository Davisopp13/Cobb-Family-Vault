import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { attachments, entries, sections } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import EntryForm from "@/components/entries/entry-form";
import EntryAttachments from "@/components/entries/entry-attachments";

interface EditEntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  const { id } = await params;
  const { user } = await validateRequest();
  if (!user) return null;

  const [entry] = await db
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.id, id),
        eq(entries.familyId, user.familyId),
        isNull(entries.deletedAt)
      )
    )
    .limit(1);

  if (!entry) notFound();

  // Check permission
  if (user.role !== "admin" && entry.createdBy !== user.id) {
    redirect(`/entry/${id}`);
  }

  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.familyId, user.familyId))
    .orderBy(sections.sortOrder);

  const section = allSections.find((s) => s.id === entry.sectionId);

  const entryAttachments = await db
    .select()
    .from(attachments)
    .where(eq(attachments.entryId, id))
    .orderBy(asc(attachments.createdAt));

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-stone-400 flex-wrap">
        <Link href="/dashboard" className="hover:text-stone-600 transition-colors">
          Dashboard
        </Link>
        {section && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/section/${section.id}`}
              className="hover:text-stone-600 transition-colors"
            >
              {section.icon} {section.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/entry/${id}`}
          className="hover:text-stone-600 transition-colors truncate max-w-[150px]"
        >
          {entry.title}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-700 font-medium">Edit</span>
      </nav>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h1 className="text-xl font-bold text-stone-900 mb-5">Edit Entry</h1>
        <EntryForm
          sections={allSections}
          defaultSectionId={entry.sectionId}
          mode="edit"
          entryId={id}
          defaultValues={{
            title: entry.title,
            content: entry.content,
            isSensitive: entry.isSensitive,
          }}
        />
      </div>

      <EntryAttachments
        entryId={id}
        initialAttachments={entryAttachments}
        currentUserId={user.id}
        isAdmin={user.role === "admin"}
      />
    </div>
  );
}
export const dynamic = "force-dynamic";
