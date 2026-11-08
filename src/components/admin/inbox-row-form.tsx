"use client";

import { updateInboxItem } from "@/app/admin/(panel)/inbox-actions";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { controlClass } from "./fields";

/** Inline status + notes editor for a lead or application row. */
export function InboxRowForm({
  table,
  id,
  status,
  notes,
  statuses,
}: {
  table: "leads" | "applications";
  id: string;
  status: string;
  notes: string;
  statuses: readonly string[];
}) {
  const { state, pending, onSubmit } = useFormAction(updateInboxItem);
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} aria-label="Status" className={`${controlClass} w-auto py-2 capitalize`}>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input name="notes" defaultValue={notes} placeholder="Notes" aria-label="Notes" className={`${controlClass} min-w-40 flex-1 py-2`} />
      <button type="submit" disabled={pending} className="btn-outline min-h-10 px-3 py-2 text-sm">
        {pending ? "Saving…" : "Save"}
      </button>
      {state && <span className={`text-xs font-medium ${state.ok ? "text-leaf-ink" : "text-red-700"}`}>{state.message}</span>}
    </form>
  );
}
