"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "heic",
  "pdf", "doc", "docx", "xls", "xlsx", "txt", "csv", "zip",
]);

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/heic",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv", "application/zip",
]);

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

interface FileUploaderProps {
  entryId: string;
  onUploadComplete: () => void;
}

export default function FileUploader({ entryId, onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return `File type .${ext} is not allowed. Allowed: images, PDF, Word, Excel, TXT, CSV, ZIP`;
    }
    if (!ALLOWED_MIME_TYPES.has(file.type) && file.type !== "") {
      return `File type "${file.type}" is not allowed`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is 25 MB`;
    }
    return null;
  }

  async function uploadFile(file: File) {
    setError(null);
    setProgress(0);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setProgress(null);
      return;
    }

    // Determine MIME type (fall back to extension-based guess if empty)
    const mimeType = file.type || "application/octet-stream";

    try {
      // 1. Get presigned upload URL
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: mimeType, entryId }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json();
        throw new Error(data.error ?? "Failed to get upload URL");
      }

      const { uploadUrl, storagePath } = await presignRes.json();

      // 2. Upload directly to R2 via XHR (for progress tracking)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", mimeType);

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.send(file);
      });

      // 3. Record in database
      const recordRes = await fetch("/api/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId,
          filename: file.name,
          storagePath,
          mimeType,
          sizeBytes: file.size,
        }),
      });

      if (!recordRes.ok) {
        const data = await recordRes.json();
        throw new Error(data.error ?? "Failed to save attachment");
      }

      setProgress(null);
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setProgress(null);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 cursor-pointer transition-colors ${
          isDragging
            ? "border-[#1e3a2f] bg-[#1e3a2f]/5"
            : "border-stone-300 hover:border-stone-400 hover:bg-stone-50"
        } ${progress !== null ? "pointer-events-none opacity-60" : ""}`}
      >
        <Upload className="w-5 h-5 text-stone-400" />
        <div className="text-center">
          <p className="text-sm text-stone-600 font-medium">
            {progress !== null ? `Uploading… ${progress}%` : "Drop a file here or click to browse"}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            Images, PDF, Word, Excel, TXT, CSV, ZIP — max 25 MB
          </p>
        </div>

        {progress !== null && (
          <div className="w-full max-w-xs bg-stone-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-[#1e3a2f] h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
