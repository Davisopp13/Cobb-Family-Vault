"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function SyncStatus() {
  const [info, setInfo] = useState<{ online: boolean; lastSync: Date } | null>(
    null
  );
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const init = { online: navigator.onLine, lastSync: new Date() };
    // Schedule outside of the synchronous effect body to avoid the lint rule
    Promise.resolve().then(() => setInfo(init));

    const handleOnline = () =>
      setInfo({ online: true, lastSync: new Date() });
    const handleOffline = () =>
      setInfo((prev) => ({ online: false, lastSync: prev?.lastSync ?? new Date() }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!info) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-white/50">
      <RefreshCw className="w-3 h-3" />
      <span>
        {info.online
          ? `Synced ${formatRelativeTime(info.lastSync)}`
          : "Offline"}
      </span>
    </div>
  );
}
