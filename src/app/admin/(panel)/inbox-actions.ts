"use server";

import { revalidatePath } from "next/cache";
import { errorMessage, isUuid, str } from "@/lib/admin/form";
import type { ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/auth";
import { APPLICATION_STATUSES, LEAD_STATUSES } from "@/lib/types";

const TABLES = {
  leads: { statuses: LEAD_STATUSES as readonly string[], path: "/admin/leads" },
  applications: { statuses: APPLICATION_STATUSES as readonly string[], path: "/admin/applications" },
} as const;

/** Updates status + notes on a lead or application. */
export async function updateInboxItem(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const table = str(fd, "table", 20) as keyof typeof TABLES;
  const cfg = TABLES[table];
  const id = str(fd, "id", 40);
  const status = str(fd, "status", 20);
  if (!cfg || !isUuid(id)) return { ok: false, message: "Invalid item." };
  if (!cfg.statuses.includes(status)) return { ok: false, message: "Invalid status." };

  const { error } = await supabase.from(table).update({ status, notes: str(fd, "notes", 2000) }).eq("id", id);
  if (error) return { ok: false, message: errorMessage(error) };
  revalidatePath(cfg.path);
  revalidatePath("/admin");
  return { ok: true, message: "Saved" };
}

export async function deleteInboxItem(fd: FormData) {
  const { supabase } = await requireAdmin();
  const table = str(fd, "table", 20) as keyof typeof TABLES;
  const id = str(fd, "id", 40);
  if (TABLES[table] && isUuid(id)) await supabase.from(table).delete().eq("id", id);
  revalidatePath(TABLES[table]?.path ?? "/admin");
}
