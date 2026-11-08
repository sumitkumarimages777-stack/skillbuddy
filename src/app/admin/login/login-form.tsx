"use client";

import { TextInput } from "@/components/admin/fields";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { signIn } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useFormAction(signIn);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <TextInput label="Email" name="email" type="email" required autoComplete="email" />
      <TextInput label="Password" name="password" type="password" required autoComplete="current-password" />
      {state && !state.ok && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
