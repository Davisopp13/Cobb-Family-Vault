import Link from "next/link";
import { eq } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { sections } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import EntryForm from "@/components/entries/entry-form";

interface NewEntryPageProps {
  searchParams: Promise<{ section?: string }>;
}

export default async function NewEntryPage({ searchParams }: NewEntryPageProps) {
  const { section: sectionId } = await searchParams;
  const { user } = await validateRequest();
  if (!user) return null;

  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.familyId, user.familyId))
    .orderBy(sections.sortOrder);

  const selectedSection = sectionId
    ? allSections.find((s) => s.id === sectionId)
    : undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-stone-400">
        <Link href="/dashboard" className="hover:text-stone-600 transition-colors">
          Dashboard
        </Link>
        {selectedSection && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/section/${selectedSection.id}`}
              className="hover:text-stone-600 transition-colors"
            >
              {selectedSection.icon} {selectedSection.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-700 font-medium">New Entry</span>
      </nav>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h1 className="text-xl font-bold text-stone-900 mb-5">Add New Entry</h1>
        <EntryForm
          sections={allSections}
          defaultSectionId={sectionId}
          mode="create"
        />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
