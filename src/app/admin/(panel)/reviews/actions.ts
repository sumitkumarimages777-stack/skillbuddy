"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bool, errorMessage, int, isUuid, optStr, str } from "@/lib/admin/form";
import type { ActionResult } from "@/lib/admin/result";
import { uploadImage } from "@/lib/admin/upload";
import { requireAdmin } from "@/lib/auth";

export async function saveReview(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  const learner = str(fd, "learner_name", 120);
  const quote = str(fd, "quote", 1200);
  if (!learner || !quote) return { ok: false, message: "Learner name and quote are required." };
  const courseId = str(fd, "course_id", 40);

  let photoUrl = optStr(fd, "photo_url", 500);
  try {
    photoUrl = (await uploadImage(supabase, fd.get("photo"), "reviews")) ?? photoUrl;
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  if (bool(fd, "remove_photo")) photoUrl = null;

  const review = {
    learner_name: learner,
    quote,
    college: str(fd, "college", 160),
    outcome_role: str(fd, "outcome_role", 120),
    outcome_company: str(fd, "outcome_company", 120),
    course_id: isUuid(courseId) ? courseId : null,
    photo_url: photoUrl,
    published: bool(fd, "published"),
    sort_order: int(fd, "sort_order") ?? 0,
  };
  const isNew = !isUuid(id);
  const { error } = isNew ? await supabase.from("reviews").insert(review) : await supabase.from("reviews").update(review).eq("id", id);
  if (error) return { ok: false, message: errorMessage(error, "Could not save the review.") };

  revalidatePath("/", "layout");
  if (isNew) redirect("/admin/reviews");
  return { ok: true, message: "Review saved." };
}

export async function deleteReview(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  if (isUuid(id)) await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/reviews");
}
