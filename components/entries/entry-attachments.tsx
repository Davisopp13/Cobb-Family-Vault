"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";
import type { Attachment } from "@/lib/schema";
import AttachmentList from "./attachment-list";
import FileUploader from "./file-uploader";

interface EntryAttachmentsProps {
  entryId: string;
  initialAttachments: Attachment[];
  currentUserId: string;
  isAdmin: boolean;
}

export default function EntryAttachments({
  entryId,
  initialAttachments,
  currentUserId,
  isAdmin,
}: EntryAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const router = useRouter();

  // Sync local state when server re-renders with fresh props (after router.refresh)
  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  function handleDelete(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleUploadComplete() {
    // Re-run the server component to pick up the new attachment from DB
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100">
        <h2 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-stone-400" />
          Attachments
          {attachments.length > 0 && (
            <span className="ml-1 text-xs font-normal text-stone-400">
              ({attachments.length})
            </span>
          )}
        </h2>
      </div>

      <div className="px-5 py-4 space-y-4">
        <AttachmentList
          attachments={attachments}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDelete={handleDelete}
        />
        <FileUploader entryId={entryId} onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  );
}
