"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createEntry, updateEntry } from "@/lib/actions/entries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Section } from "@/lib/schema";

interface EntryFormProps {
  sections: Section[];
  defaultSectionId?: string;
  mode: "create" | "edit";
  entryId?: string;
  defaultValues?: {
    title: string;
    content: string;
    isSensitive: boolean;
  };
}

const DRAFT_KEY = "entry-draft";
const initialState = { error: undefined as string | undefined };

export default function EntryForm({
  sections,
  defaultSectionId,
  mode,
  entryId,
  defaultValues,
}: EntryFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [isSensitive, setIsSensitive] = useState(
    defaultValues?.isSensitive ?? false
  );
  const [sectionId, setSectionId] = useState(defaultSectionId ?? "");
  const [preview, setPreview] = useState(false);
  const draftLoaded = useRef(false);

  // Load draft from localStorage on mount (create mode only)
  useEffect(() => {
    if (mode !== "create" || draftLoaded.current || defaultValues) return;
    draftLoaded.current = true;
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const draft = JSON.parse(saved);
      if (draft.title) setTitle(draft.title);
      if (draft.content) setContent(draft.content);
      if (draft.sectionId) setSectionId(draft.sectionId);
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (mode !== "create") return;
    const timeout = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, content, sectionId })
      );
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, content, sectionId, mode]);

  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      if (mode === "create") {
        const result = await createEntry(formData);
        if (!result?.error) localStorage.removeItem(DRAFT_KEY);
        return result ?? initialState;
      } else {
        const result = await updateEntry(entryId!, formData);
        return result ?? initialState;
      }
    },
    initialState
  );

  function renderPreview(text: string): string {
    return text
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
      .split("\n\n")
      .map((para) => {
        if (
          para.startsWith("<h") ||
          para.startsWith("<li") ||
          para.startsWith("<blockquote")
        ) {
          return para;
        }
        return `<p>${para.replace(/\n/g, "<br>")}</p>`;
      })
      .join("\n");
  }

  return (
    <form action={action} className="space-y-4">
      {/* Section selector */}
      <div className="space-y-1.5">
        <Label htmlFor="sectionId">Section</Label>
        <select
          id="sectionId"
          name="sectionId"
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          required
          className="flex h-9 w-full rounded-lg border border-stone-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a2f] focus-visible:ring-offset-1"
        >
          <option value="">Select a section…</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Chase Checking Account"
          required
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content</Label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                !preview
                  ? "bg-stone-200 text-stone-800"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                preview
                  ? "bg-stone-200 text-stone-800"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {preview ? (
          <div className="min-h-[200px] w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm prose-vault">
            {content ? (
              <div
                dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
              />
            ) : (
              <p className="text-stone-400 italic">Nothing to preview yet…</p>
            )}
          </div>
        ) : (
          <Textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the details here. Markdown is supported: **bold**, *italic*, # heading, - list item…"
            className="min-h-[200px] font-mono text-sm"
            required
          />
        )}
        {/* Hidden field carries content when preview is shown */}
        {preview && <input type="hidden" name="content" value={content} />}

        <p className="text-xs text-stone-400">
          Supports Markdown: **bold**, *italic*, # heading, - list, `code`
        </p>
      </div>

      {/* Sensitive toggle */}
      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <input
          type="checkbox"
          id="isSensitive"
          checked={isSensitive}
          onChange={(e) => setIsSensitive(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-stone-300 text-amber-600"
        />
        <input
          type="hidden"
          name="isSensitive"
          value={isSensitive ? "true" : "false"}
        />
        <div>
          <Label htmlFor="isSensitive" className="text-amber-800 cursor-pointer">
            🔒 Mark as sensitive
          </Label>
          <p className="text-xs text-amber-600 mt-0.5">
            Content will be hidden until clicked — good for passwords, SSNs,
            financial details
          </p>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? mode === "create"
              ? "Saving…"
              : "Updating…"
            : mode === "create"
            ? "Save Entry"
            : "Update Entry"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={entryId ? `/entry/${entryId}` : "/dashboard"}>
            Cancel
          </Link>
        </Button>
      </div>
    </form>
  );
}
