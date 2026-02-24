"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { removeMember, updateMemberRole } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface MemberActionsProps {
  memberId: string;
  currentRole: string;
}

export default function MemberActions({
  memberId,
  currentRole,
}: MemberActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleToggle = async () => {
    setLoading(true);
    const newRole = currentRole === "admin" ? "member" : "admin";
    await updateMemberRole(memberId, newRole);
    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  const handleRemove = async () => {
    if (!confirm("Remove this member? They will lose access to the vault."))
      return;
    setLoading(true);
    await removeMember(memberId);
    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-400"
        disabled={loading}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-stone-200 shadow-lg py-1 min-w-[160px]">
            <button
              onClick={handleRoleToggle}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            >
              {currentRole === "admin" ? (
                <>
                  <ShieldOff className="w-4 h-4 text-stone-400" />
                  Make Member
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-stone-400" />
                  Make Admin
                </>
              )}
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}
