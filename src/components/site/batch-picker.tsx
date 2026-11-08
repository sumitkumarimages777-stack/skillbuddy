"use client";

import { createContext, use, useState } from "react";
import { submitApplication } from "@/app/actions";
import { useFormAction } from "@/lib/hooks/use-form-action";
import type { CourseBatch } from "@/lib/types";
import { FormMessage, Honeypot } from "./form-message";

type Ctx = { batches: CourseBatch[]; selected: CourseBatch | null; select: (i: number) => void };
const BatchContext = createContext<Ctx | null>(null);

function useBatch() {
  const ctx = use(BatchContext);
  if (!ctx) throw new Error("useBatch must be used inside <BatchProvider>");
  return ctx;
}

/** Shares the chosen batch between the hero enrol card and the application form. */
export function BatchProvider({ batches, children }: { batches: CourseBatch[]; children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  return (
    <BatchContext value={{ batches, selected: batches[index] ?? null, select: setIndex }}>{children}</BatchContext>
  );
}

export function BatchChooser() {
  const { batches, selected, select } = useBatch();
  if (!batches.length) return null;
  return (
    <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
      <legend className="mb-2.5 text-sm font-semibold">Choose your batch</legend>
      {batches.map((b, i) => {
        const active = b === selected;
        return (
          <button
            key={b.id ?? i}
            type="button"
            aria-pressed={active}
            onClick={() => select(i)}
            className={`flex min-h-11 cursor-pointer flex-col gap-0.5 rounded-xl px-4 py-3.5 text-left text-ink ${
              active ? "border-2 border-brand bg-brand-soft" : "border border-line-strong bg-white hover:border-ink"
            }`}
          >
            <span className={`text-[15px] ${active ? "font-bold" : "font-semibold"}`}>{b.name}</span>
            <span className="text-[13px] text-body">{b.schedule}</span>
          </button>
        );
      })}
    </fieldset>
  );
}

export function ApplyLabel({ fallback }: { fallback: string }) {
  const { selected } = useBatch();
  return <>{selected ? `Apply for ${selected.name.replace(/ batch$/i, "")}` : fallback}</>;
}

export function ApplicationForm({ courseId }: { courseId: string }) {
  const { batches, selected, select } = useBatch();
  const { state, pending, formRef, onSubmit } = useFormAction(submitApplication, { resetOnSuccess: true });
  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative flex min-w-0 flex-[1_1_340px] flex-col gap-3">
      <Honeypot />
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="batch_id" value={selected?.id ?? ""} />
      <input type="hidden" name="batch_name" value={selected?.name ?? ""} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Full name
        <input name="full_name" type="text" required maxLength={120} autoComplete="name" className="input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        College &amp; year
        <input name="college_year" type="text" maxLength={200} placeholder="e.g. Hansraj College, 2nd year" className="input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        WhatsApp number
        <input name="phone" type="tel" required inputMode="tel" autoComplete="tel" placeholder="+91" className="input" />
      </label>
      {batches.length > 1 && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Batch
          <select
            className="input"
            value={selected ? batches.indexOf(selected) : 0}
            onChange={(e) => select(Number(e.target.value))}
          >
            {batches.map((b, i) => (
              <option key={b.id ?? i} value={i}>
                {b.name} — {b.schedule}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="submit" disabled={pending} className="btn-sun py-[15px] text-base">
        {pending ? "Submitting…" : "Submit application"}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
