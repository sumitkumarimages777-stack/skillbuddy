"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bool, errorMessage, int, isUuid, optStr, str } from "@/lib/admin/form";
import type { ActionResult } from "@/lib/admin/result";
import { uploadImage } from "@/lib/admin/upload";
import { requireAdmin } from "@/lib/auth";

export async function saveMentor(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  const name = str(fd, "name", 120);
  if (!name) return { ok: false, message: "Name is required." };
  const track = str(fd, "track", 40);
  if (!track) return { ok: false, message: "Pick a track." };

  let photoUrl = optStr(fd, "photo_url", 500);
  try {
    photoUrl = (await uploadImage(supabase, fd.get("photo"), "mentors")) ?? photoUrl;
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  if (bool(fd, "remove_photo")) photoUrl = null;

  const mentor = {
    name,
    track,
    role: str(fd, "role", 120),
    company: str(fd, "company", 120),
    bio: str(fd, "bio", 600),
    photo_url: photoUrl,
    photo_position_y: Math.min(100, Math.max(0, int(fd, "photo_position_y") ?? 50)),
    linkedin_url: optStr(fd, "linkedin_url", 500),
    published: bool(fd, "published"),
    sort_order: int(fd, "sort_order") ?? 0,
  };

  const isNew = !isUuid(id);
  const { data, error } = isNew
    ? await supabase.from("mentors").insert(mentor).select("id").single()
    : await supabase.from("mentors").update(mentor).eq("id", id).select("id").single();
  if (error?.code === "23503") return { ok: false, message: "Pick a valid track." };
  if (error || !data) return { ok: false, message: errorMessage(error, "Could not save the mentor.") };

  revalidatePath("/", "layout");
  if (isNew) redirect("/admin/mentors");
  return { ok: true, message: "Mentor saved." };
}

export async function deleteMentor(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  if (isUuid(id)) await supabase.from("mentors").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/mentors");
}
