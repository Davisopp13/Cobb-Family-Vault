"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  defaultValue?: string;
}

export default function SearchInput({ defaultValue }: SearchInputProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValue(val);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (val.trim().length >= 2 || val.trim().length === 0) {
          const params = val.trim()
            ? `?q=${encodeURIComponent(val.trim())}`
            : "";
          router.push(`/dashboard/search${params}`);
        }
      }, 300);
    },
    [router]
  );

  const handleClear = () => {
    setValue("");
    router.push("/dashboard/search");
  };

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search all entries…"
        autoFocus
        className="flex h-11 w-full rounded-xl border border-stone-300 bg-white pl-10 pr-10 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a2f] focus-visible:ring-offset-1"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-stone-100 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-stone-400" />
        </button>
      )}
    </div>
  );
}
