"use client";

import { useActionState } from "react";
import { setupFamily } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: undefined as string | undefined };

export default function SetupForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await setupFamily(formData);
      return result ?? initialState;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <h2 className="font-semibold text-stone-800 mb-1">
          Step 1 of 1 — Create Your Family Vault
        </h2>
        <p className="text-sm text-stone-500">
          Start by naming your family vault and creating your admin account.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="familyName">Family Vault Name</Label>
        <Input
          id="familyName"
          name="familyName"
          placeholder="e.g., Cobb Family"
          defaultValue="Cobb Family"
          required
        />
        <p className="text-xs text-stone-400">
          This will appear across the app as your vault&apos;s name.
        </p>
      </div>

      <div className="border-t border-stone-100 pt-4">
        <p className="text-sm font-medium text-stone-700 mb-3">
          Your Admin Account
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Your Name</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="e.g., Lance Cobb"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="lance@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Setting up your vault…" : "Create My Family Vault →"}
      </Button>

      <p className="text-xs text-stone-400 text-center">
        This creates your vault with 15 pre-built sections. You can invite
        family members after setup.
      </p>
    </form>
  );
}
