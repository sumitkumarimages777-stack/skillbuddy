"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bool, errorMessage, int, isUuid, str } from "@/lib/admin/form";
import type { ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/auth";

export async function saveFaq(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  const question = str(fd, "question", 300);
  const answer = str(fd, "answer", 3000);
  if (!question || !answer) return { ok: false, message: "Question and answer are required." };
  const faq = { question, answer, published: bool(fd, "published"), sort_order: int(fd, "sort_order") ?? 0 };
  const isNew = !isUuid(id);
  const { error } = isNew ? await supabase.from("faqs").insert(faq) : await supabase.from("faqs").update(faq).eq("id", id);
  if (error) return { ok: false, message: errorMessage(error, "Could not save the FAQ.") };
  revalidatePath("/", "layout");
  if (isNew) redirect("/admin/faqs");
  return { ok: true, message: "FAQ saved." };
}

export async function deleteFaq(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  if (isUuid(id)) await supabase.from("faqs").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/faqs");
}
