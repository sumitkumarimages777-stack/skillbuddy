"use server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

export type FormState = { ok: boolean; message: string } | null;

const clean = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);

function normalisePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  const plain = digits.replace(/^\+/, "");
  if (!/^\d{10,13}$/.test(plain)) return null;
  return digits.startsWith("+") ? digits : plain.length === 10 ? `+91${plain}` : `+${plain}`;
}

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

/** "Request a call back" / "Talk to a counsellor". */
export async function submitLead(_prev: FormState, formData: FormData): Promise<FormState> {
  if (clean(formData.get("website"))) return { ok: true, message: "Thanks! We'll call you soon." }; // honeypot

  const name = clean(formData.get("name"), 120);
  const phone = normalisePhone(clean(formData.get("phone"), 30));
  const courseId = clean(formData.get("course_id"), 40);
  if (!name) return { ok: false, message: "Please tell us your name." };
  if (!phone) return { ok: false, message: "Please enter a valid WhatsApp number (10 digits)." };

  if (!isSupabaseConfigured) {
    return { ok: true, message: "Demo mode: connect Supabase to start saving requests." };
  }

  const { error } = await createPublicClient()
    .from("leads")
    .insert({ name, phone, source: courseId ? "course" : "home", course_id: isUuid(courseId) ? courseId : null });
  if (error) {
    console.error("submitLead", error.message);
    return { ok: false, message: "Something went wrong. Please try again in a minute." };
  }
  return { ok: true, message: "Thanks! A SkillBuddy counsellor will call you within 24 hours." };
}

/** "Reserve your seat" application on a cohort page. */
export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  if (clean(formData.get("website"))) return { ok: true, message: "Application received." };

  const fullName = clean(formData.get("full_name"), 120);
  const collegeYear = clean(formData.get("college_year"), 200);
  const phone = normalisePhone(clean(formData.get("phone"), 30));
  const courseId = clean(formData.get("course_id"), 40);
  const batchId = clean(formData.get("batch_id"), 40);
  const batchName = clean(formData.get("batch_name"), 120);

  if (!fullName) return { ok: false, message: "Please enter your full name." };
  if (!phone) return { ok: false, message: "Please enter a valid WhatsApp number (10 digits)." };
  if (!isUuid(courseId)) return { ok: false, message: "This cohort is not accepting applications right now." };

  if (!isSupabaseConfigured) {
    return { ok: true, message: "Demo mode: connect Supabase to start saving applications." };
  }

  const { error } = await createPublicClient()
    .from("applications")
    .insert({
      course_id: courseId,
      batch_id: isUuid(batchId) ? batchId : null,
      batch_name: batchName,
      full_name: fullName,
      college_year: collegeYear,
      phone,
    });
  if (error) {
    console.error("submitApplication", error.message);
    return { ok: false, message: "Something went wrong. Please try again in a minute." };
  }
  return { ok: true, message: "Application received! Our team will call you within 24 hours." };
}
