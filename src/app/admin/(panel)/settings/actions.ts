"use server";

import { revalidatePath } from "next/cache";
import { errorMessage, int, optStr } from "@/lib/admin/form";
import type { ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/auth";

export async function saveSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const settings = {
    announcement_html: optStr(fd, "announcement_html", 400),
    announcement_link_label: optStr(fd, "announcement_link_label", 60),
    announcement_link_url: optStr(fd, "announcement_link_url", 300),
    admissions_badge: optStr(fd, "admissions_badge", 120),
    hero_title: optStr(fd, "hero_title", 200),
    hero_highlight: optStr(fd, "hero_highlight", 80),
    hero_subtitle: optStr(fd, "hero_subtitle", 500),
    max_batch_size: int(fd, "max_batch_size"),
    company_name: optStr(fd, "company_name", 120),
    contact_email: optStr(fd, "contact_email", 200),
    contact_phone: optStr(fd, "contact_phone", 30),
  };
  const { error } = await supabase.from("site_settings").update(settings).eq("id", 1);
  if (error) return { ok: false, message: errorMessage(error, "Could not save settings.") };
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved. The public site updates right away." };
}
