"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface EntryContentProps {
  content: string;
  title: string;
  isSensitive: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^---$/gm, "<hr>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .split("\n\n")
    .map((para) => {
      if (para.startsWith("<h") || para.startsWith("<li") || para.startsWith("<blockquote") || para.startsWith("<hr")) {
        return para;
      }
      return `<p>${para.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

export default function EntryContent({
  content,
  title,
  isSensitive,
}: EntryContentProps) {
  const [revealed, setRevealed] = useState(false);

  if (isSensitive && !revealed) {
    return (
      <div className="px-5 py-8 text-center">
        <div className="inline-flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <div>
            <p className="font-semibold text-stone-700">{title}</p>
            <p className="text-sm text-stone-400 mt-1">
              This entry is marked as sensitive.
            </p>
          </div>
          <button
            onClick={() => setRevealed(true)}
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Reveal Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      {isSensitive && revealed && (
        <div className="flex items-center justify-between mb-4 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <span className="text-xs text-amber-700 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Sensitive content is visible
          </span>
          <button
            onClick={() => setRevealed(false)}
            className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Hide
          </button>
        </div>
      )}
      <div
        className="prose-vault"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
