"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteEntry } from "@/lib/actions/entries";

interface DeleteEntryButtonProps {
  entryId: string;
}

export default function DeleteEntryButton({ entryId }: DeleteEntryButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteEntry(entryId);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-sm text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Delete
    </button>
  );
}
