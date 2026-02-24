"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  // Start with null to avoid hydration mismatch; populate after mount
  const [offline, setOffline] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-30 bg-amber-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-md">
      <WifiOff className="w-4 h-4" />
      You&apos;re offline — showing cached content. Some features may be unavailable.
    </div>
  );
}
