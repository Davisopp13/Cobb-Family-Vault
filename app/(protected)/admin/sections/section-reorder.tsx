"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { reorderSection } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import type { Section } from "@/lib/schema";

interface SectionReorderProps {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
}

export default function SectionReorder({
  section,
  isFirst,
  isLast,
}: SectionReorderProps) {
  const router = useRouter();

  const handleMove = async (direction: "up" | "down") => {
    await reorderSection(section.id, direction);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{section.icon}</span>
        <div>
          <p className="text-sm font-medium text-stone-800">{section.name}</p>
          {section.description && (
            <p className="text-xs text-stone-400 truncate max-w-xs">
              {section.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!section.isDefault && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mr-2 font-medium">
            Custom
          </span>
        )}
        <button
          onClick={() => handleMove("up")}
          disabled={isFirst}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-stone-400"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleMove("down")}
          disabled={isLast}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-stone-400"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
