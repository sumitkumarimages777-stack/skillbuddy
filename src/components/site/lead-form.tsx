"use client";

import { submitLead } from "@/app/actions";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { FormMessage, Honeypot } from "./form-message";

export function LeadForm({ courseId }: { courseId?: string }) {
  const { state, pending, formRef, onSubmit } = useFormAction(submitLead, { resetOnSuccess: true });
  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative flex min-w-0 flex-[1_1_360px] flex-col gap-3">
      <Honeypot />
      {courseId && <input type="hidden" name="course_id" value={courseId} />}
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Your name
        <input name="name" type="text" required maxLength={120} autoComplete="name" placeholder="e.g. Aditi Sharma" className="input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        WhatsApp number
        <input name="phone" type="tel" required inputMode="tel" autoComplete="tel" placeholder="+91" className="input" />
      </label>
      <button type="submit" disabled={pending} className="btn-sun py-[15px] text-base">
        {pending ? "Sending…" : "Request a call back"}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
