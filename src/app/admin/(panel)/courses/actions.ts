"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bool, date, errorMessage, int, isUuid, jsonList, optStr, str } from "@/lib/admin/form";
import type { ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { PROJECT_ACCENTS } from "@/lib/types";

type Row = Record<string, string | undefined>;

/** Makes a child table match the submitted rows: updates kept ids, inserts new rows, deletes the rest. */
async function syncChildren(
  supabase: SupabaseClient,
  table: string,
  courseId: string,
  rows: Row[],
  toRecord: (r: Row) => Record<string, unknown> | null,
) {
  const records = rows
    .map((r, position) => {
      const rec = toRecord(r);
      if (!rec) return null;
      return { ...(isUuid(r.id) ? { id: r.id } : {}), ...rec, course_id: courseId, position };
    })
    .filter(Boolean) as Record<string, unknown>[];

  const keepIds = records.map((r) => r.id).filter(Boolean) as string[];
  let del = supabase.from(table).delete().eq("course_id", courseId);
  if (keepIds.length) del = del.not("id", "in", `(${keepIds.join(",")})`);
  const { error: delError } = await del;
  if (delError) throw delError;

  const existing = records.filter((r) => r.id);
  const fresh = records.filter((r) => !r.id);
  if (existing.length) {
    const { error } = await supabase.from(table).upsert(existing);
    if (error) throw error;
  }
  if (fresh.length) {
    const { error } = await supabase.from(table).insert(fresh);
    if (error) throw error;
  }
}

const t = (v: string | undefined, max = 2000) => (v ?? "").trim().slice(0, max);

export async function saveCourse(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  const title = str(fd, "title", 200);
  if (!title) return { ok: false, message: "Title is required." };
  const slug = slugify(str(fd, "slug", 80) || title);
  if (!slug) return { ok: false, message: "Slug must contain letters or numbers." };
  const category = str(fd, "category", 40);
  if (!category) return { ok: false, message: "Pick a category." };
  const leadMentor = str(fd, "lead_mentor_id", 40);
  const discount = int(fd, "dubuddy_discount");

  const course = {
    title,
    slug,
    category,
    short_title: str(fd, "short_title", 120),
    short_code: str(fd, "short_code", 4).toUpperCase(),
    blurb: str(fd, "blurb", 400),
    description: str(fd, "description", 2000),
    duration_weeks: int(fd, "duration_weeks"),
    format: str(fd, "format", 120),
    mode: str(fd, "mode", 120),
    effort: str(fd, "effort", 120),
    batch_size: int(fd, "batch_size"),
    start_date: date(fd, "start_date"),
    applications_close: date(fd, "applications_close"),
    price: int(fd, "price"),
    emi_from: int(fd, "emi_from"),
    dubuddy_discount: discount == null ? null : Math.min(100, Math.max(0, discount)),
    seats_left: int(fd, "seats_left"),
    outcomes: jsonList<string>(fd, "outcomes").map((o) => String(o).trim().slice(0, 300)).filter(Boolean),
    syllabus_url: optStr(fd, "syllabus_url", 500),
    lead_mentor_id: isUuid(leadMentor) ? leadMentor : null,
    guest_mentors_note: str(fd, "guest_mentors_note", 400),
    featured: bool(fd, "featured"),
    published: bool(fd, "published"),
    sort_order: int(fd, "sort_order") ?? 0,
  };

  const isNew = !isUuid(id);
  const { data, error } = isNew
    ? await supabase.from("courses").insert(course).select("id").single()
    : await supabase.from("courses").update(course).eq("id", id).select("id").single();
  if (error?.code === "23503") return { ok: false, message: "Pick a valid category." };
  if (error || !data) return { ok: false, message: errorMessage(error, "Could not save the course.") };
  const courseId = data.id as string;

  try {
    await syncChildren(supabase, "course_modules", courseId, jsonList<Row>(fd, "modules"), (r) =>
      t(r.title) ? { weeks_label: t(r.weeks_label, 60), title: t(r.title, 200), topics: t(r.topics), assignment: t(r.assignment, 500) } : null,
    );
    await syncChildren(supabase, "course_batches", courseId, jsonList<Row>(fd, "batches"), (r) =>
      t(r.name) ? { name: t(r.name, 120), schedule: t(r.schedule, 200) } : null,
    );
    await syncChildren(supabase, "course_projects", courseId, jsonList<Row>(fd, "projects"), (r) =>
      t(r.title)
        ? {
            title: t(r.title, 200),
            description: t(r.description, 600),
            accent: PROJECT_ACCENTS.includes(r.accent as never) ? r.accent : "blue",
            image_url: t(r.image_url, 500) || null,
          }
        : null,
    );
    await syncChildren(supabase, "course_week_plan", courseId, jsonList<Row>(fd, "week_plan"), (r) =>
      t(r.day_label) ? { day_label: t(r.day_label, 60), activity: t(r.activity, 200), detail: t(r.detail, 300) } : null,
    );
  } catch (e) {
    return { ok: false, message: `Course saved, but its lists failed: ${errorMessage(e as { message: string })}` };
  }

  revalidatePath("/", "layout");
  if (isNew) redirect(`/admin/courses/${courseId}?created=1`);
  return { ok: true, message: "Course saved." };
}

export async function deleteCourse(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  if (isUuid(id)) await supabase.from("courses").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/courses");
}

export async function toggleCoursePublished(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  if (isUuid(id)) await supabase.from("courses").update({ published: fd.get("published") === "true" }).eq("id", id);
  revalidatePath("/", "layout");
}
