import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { sections } from "@/lib/schema";
import { validateRequest } from "@/lib/session";
import SectionReorder from "./section-reorder";
import AddSectionForm from "./add-section-form";

export default async function SectionsPage() {
  const { user } = await validateRequest();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.familyId, user.familyId))
    .orderBy(sections.sortOrder);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-stone-400">
        <Link href="/admin" className="hover:text-stone-600 transition-colors">
          Admin
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-700 font-medium">Sections</span>
      </nav>

      <h1 className="text-2xl font-bold text-stone-900">Manage Sections</h1>

      {/* Section list */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
          Sections ({allSections.length})
        </h2>
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
          {allSections.map((section, idx) => (
            <SectionReorder
              key={section.id}
              section={section}
              isFirst={idx === 0}
              isLast={idx === allSections.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Add custom section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Custom Section
        </h2>
        <AddSectionForm />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
