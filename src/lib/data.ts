import "server-only";
import { demoCourses, demoFaqs, demoMentors, demoReviews, demoSettings } from "./demo-data";
import { isSupabaseConfigured } from "./supabase/env";
import { createPublicClient } from "./supabase/server";
import { DEFAULT_CATEGORIES } from "./types";
import type { CategoryItem, Course, CourseDetail, Faq, Mentor, Review, SiteSettings } from "./types";

/* Public, read-only queries. RLS limits results to published rows. */

const byPosition = <T extends { position?: number }>(a: T, b: T) => (a.position ?? 0) - (b.position ?? 0);

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return demoSettings;
  const { data, error } = await createPublicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) console.error("getSettings", error.message);
  return { ...demoSettings, ...(data ?? {}) };
}

export async function getCategories(): Promise<CategoryItem[]> {
  if (!isSupabaseConfigured) return DEFAULT_CATEGORIES;
  const { data, error } = await createPublicClient().from("categories").select("id, label, sort_order").order("sort_order").order("label");
  if (error) console.error("getCategories", error.message);
  return data && data.length ? (data as CategoryItem[]) : DEFAULT_CATEGORIES;
}

export async function getCourses(): Promise<Course[]> {
  if (!isSupabaseConfigured) return demoCourses;
  const { data, error } = await createPublicClient()
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("sort_order")
    .order("created_at");
  if (error) console.error("getCourses", error.message);
  return (data ?? []) as Course[];
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  if (!isSupabaseConfigured) {
    const c = demoCourses.find((x) => x.slug === slug);
    return c ? { ...c, lead_mentor: demoMentors.find((m) => m.id === c.lead_mentor_id) ?? null } : null;
  }
  const { data, error } = await createPublicClient()
    .from("courses")
    .select(
      "*, modules:course_modules(*), projects:course_projects(*), batches:course_batches(*), week_plan:course_week_plan(*), lead_mentor:mentors(*)",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) console.error("getCourseBySlug", error.message);
  if (!data) return null;
  const d = data as CourseDetail;
  return {
    ...d,
    modules: [...(d.modules ?? [])].sort(byPosition),
    projects: [...(d.projects ?? [])].sort(byPosition),
    batches: [...(d.batches ?? [])].sort(byPosition),
    week_plan: [...(d.week_plan ?? [])].sort(byPosition),
    lead_mentor: d.lead_mentor && d.lead_mentor.published ? d.lead_mentor : null,
  };
}

export async function getMentors(): Promise<Mentor[]> {
  if (!isSupabaseConfigured) return demoMentors;
  const { data, error } = await createPublicClient().from("mentors").select("*").eq("published", true).order("sort_order");
  if (error) console.error("getMentors", error.message);
  return (data ?? []) as Mentor[];
}

export async function getReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    return demoReviews.map((r) => {
      const c = demoCourses.find((x) => x.id === r.course_id);
      return { ...r, course: c ? { title: c.title, short_title: c.short_title } : null };
    });
  }
  const { data, error } = await createPublicClient()
    .from("reviews")
    .select("*, course:courses(title, short_title)")
    .eq("published", true)
    .order("sort_order");
  if (error) console.error("getReviews", error.message);
  return (data ?? []) as Review[];
}

export async function getFaqs(): Promise<Faq[]> {
  if (!isSupabaseConfigured) return demoFaqs;
  const { data, error } = await createPublicClient().from("faqs").select("*").eq("published", true).order("sort_order");
  if (error) console.error("getFaqs", error.message);
  return (data ?? []) as Faq[];
}
