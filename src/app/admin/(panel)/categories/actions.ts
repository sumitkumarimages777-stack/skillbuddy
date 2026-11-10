"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { errorMessage, int, str } from "@/lib/admin/form";
import type { ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function saveCategory(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const existingId = str(fd, "id", 40);
  const label = str(fd, "label", 60);
  if (!label) return { ok: false, message: "Name is required." };
  const id = slugify(str(fd, "slug", 40) || label).slice(0, 40);
  if (!id) return { ok: false, message: "Slug must contain letters or numbers." };

  const category = { id, label, sort_order: int(fd, "sort_order") ?? 0 };
  const isNew = !existingId;
  // Changing the slug of an existing category cascades to its mentors and courses.
  const { error } = isNew
    ? await supabase.from("categories").insert(category)
    : await supabase.from("categories").update(category).eq("id", existingId);
  if (error) return { ok: false, message: errorMessage(error, "Could not save the category.") };

  revalidatePath("/", "layout");
  if (isNew || id !== existingId) redirect("/admin/categories");
  return { ok: true, message: "Category saved." };
}

export async function deleteCategory(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) redirect(`/admin/categories/${encodeURIComponent(id)}?error=in-use`);
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}
