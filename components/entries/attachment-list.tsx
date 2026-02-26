"use client";

import { useEffect, useState } from "react";
import { File, Download, Trash2 } from "lucide-react";
import type { Attachment } from "@/lib/schema";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/heic",
]);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ThumbnailImage({ attachmentId, filename }: { attachmentId: string; filename: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/attachments/${attachmentId}`)
      .then((r) => r.json())
      .then(({ downloadUrl }) => setSrc(downloadUrl))
      .catch(() => {});
  }, [attachmentId]);

  if (!src) {
    return <div className="w-10 h-10 rounded bg-stone-100 animate-pulse" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={filename}
      loading="lazy"
      className="w-10 h-10 rounded object-cover bg-stone-100"
    />
  );
}

interface AttachmentItemProps {
  attachment: Attachment;
  currentUserId: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

function AttachmentItem({ attachment, currentUserId, isAdmin, onDelete }: AttachmentItemProps) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isImage = IMAGE_MIME_TYPES.has(attachment.mimeType);
  const canDelete = isAdmin || attachment.uploadedBy === currentUserId;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/attachments/${attachment.id}`);
      if (!res.ok) throw new Error("Failed to get download URL");
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      // no-op
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${attachment.filename}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/attachments/${attachment.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onDelete(attachment.id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors">
      <div className="flex-shrink-0">
        {isImage ? (
          <ThumbnailImage attachmentId={attachment.id} filename={attachment.filename} />
        ) : (
          <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center">
            <File className="w-5 h-5 text-stone-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">{attachment.filename}</p>
        <p className="text-xs text-stone-400">{formatBytes(attachment.sizeBytes)}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleDownload}
          disabled={downloading}
          title="Download"
          className="p-1.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="p-1.5 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface AttachmentListProps {
  attachments: Attachment[];
  currentUserId: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export default function AttachmentList({
  attachments,
  currentUserId,
  isAdmin,
  onDelete,
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return <p className="text-sm text-stone-400 italic">No files attached yet.</p>;
  }

  return (
    <div className="space-y-2">
      {attachments.map((a) => (
        <AttachmentItem
          key={a.id}
          attachment={a}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
