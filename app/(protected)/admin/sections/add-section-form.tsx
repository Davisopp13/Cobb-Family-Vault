"use client";

import { useActionState } from "react";
import { createCustomSection } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: undefined as string | undefined };

export default function AddSectionForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createCustomSection(formData);
      return result ?? initialState;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="icon">Icon (emoji)</Label>
          <Input
            id="icon"
            name="icon"
            placeholder="📁"
            maxLength={2}
            className="text-lg"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Section Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Vehicle Information"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          name="description"
          placeholder="Brief description of what belongs here…"
        />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add Section"}
      </Button>
    </form>
  );
}
