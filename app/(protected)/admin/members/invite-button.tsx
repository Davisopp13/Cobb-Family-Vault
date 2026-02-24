"use client";

import { useState } from "react";
import { UserPlus, Copy, Check, X } from "lucide-react";
import { createInvite } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InviteButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("email", email);
    const result = await createInvite(formData);

    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
    } else if ("url" in result) {
      setInviteUrl(result.url ?? null);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setError(null);
    setInviteUrl(null);
    setCopied(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <UserPlus className="w-4 h-4" />
        Invite Member
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4 text-stone-400" />
            </button>

            <h2 className="text-lg font-bold text-stone-900 mb-1">
              Invite Family Member
            </h2>
            <p className="text-sm text-stone-500 mb-5">
              Enter their email to generate an invite link. The link expires in 7 days.
            </p>

            {!inviteUrl ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="family@example.com"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Generating…" : "Generate Invite Link"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-emerald-800 mb-1">
                    ✅ Invite link generated!
                  </p>
                  <p className="text-xs text-emerald-600">
                    Share this link with your family member. It expires in 7 days.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    readOnly
                    value={inviteUrl}
                    className="flex-1 h-9 rounded-lg border border-stone-200 bg-stone-50 px-3 text-xs font-mono text-stone-600 overflow-hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-stone-400">
                  Copy and send this link via text, email, or any messaging app.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
