"use client";

import { useActionState } from "react";
import { acceptInvite } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteFormProps {
  token: string;
  email: string;
}

const initialState = { error: undefined as string | undefined };

export default function InviteForm({ token, email }: InviteFormProps) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await acceptInvite(token, formData);
      return result ?? initialState;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          readOnly
          className="bg-stone-50 text-stone-500"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="displayName">Your Name</Label>
        <Input
          id="displayName"
          name="displayName"
          placeholder="e.g., Sarah Cobb"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Create Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          required
          minLength={8}
        />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Join the Family Vault →"}
      </Button>
    </form>
  );
}
