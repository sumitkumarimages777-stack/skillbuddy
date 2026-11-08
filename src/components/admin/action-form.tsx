"use client";

import { createContext, use, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/admin/result";
import { useFormAction } from "@/lib/hooks/use-form-action";

// Pending state for forms submitted via useFormAction (useFormStatus can't see those).
const PendingContext = createContext<boolean | null>(null);

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/** Form wrapper for admin server actions: shows success / error feedback inline. */
export function ActionForm({
  action,
  children,
  className = "flex flex-col gap-6",
  resetOnSuccess = false,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const { state, pending, formRef, onSubmit } = useFormAction(action, { resetOnSuccess });

  return (
    <form ref={formRef} onSubmit={onSubmit} className={className}>
      <PendingContext value={pending}>{children}</PendingContext>
      {state && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${state.ok ? "bg-leaf-soft text-leaf-ink" : "bg-red-50 text-red-700"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

export function SubmitButton({ children = "Save", pendingText = "Saving…", className = "btn-primary" }: { children?: ReactNode; pendingText?: string; className?: string }) {
  const ctxPending = use(PendingContext);
  const { pending: statusPending } = useFormStatus();
  const pending = ctxPending ?? statusPending;
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

/** A tiny standalone form that asks for confirmation before running a destructive action. */
export function ConfirmButton({
  action,
  id,
  label = "Delete",
  confirm = "Delete this item? This can't be undone.",
  className = "btn border border-red-200 bg-white text-red-700 hover:bg-red-50",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  confirm?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton className={className} pendingText="Deleting…">
        {label}
      </SubmitButton>
    </form>
  );
}
