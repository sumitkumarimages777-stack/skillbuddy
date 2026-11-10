"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate, formatPrice, weeksLabel } from "@/lib/format";
import { categoryLabel, type Category, type CategoryItem, type Course } from "@/lib/types";

export function CourseGrid({ courses, categories }: { courses: Course[]; categories: CategoryItem[] }) {
  const [cat, setCat] = useState<"all" | Category>("all");
  const tabs: { id: "all" | Category; label: string }[] = [{ id: "all", label: "All programs" }, ...categories].filter((t) => t.id === "all" || courses.some((c) => c.category === t.id));
  const shown = cat === "all" ? courses : courses.filter((c) => c.category === cat);

  return (
    <>
      <div role="tablist" aria-label="Filter programs" className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.id === cat;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCat(t.id)}
              className={`min-h-11 cursor-pointer rounded-full border px-[18px] py-3 text-[15px] ${
                active ? "border-ink bg-ink font-semibold text-white" : "border-line-strong bg-white font-medium text-ink hover:border-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {shown.length === 0 ? (
        <p className="text-body">No programs in this category yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5">
          {shown.map((c) => (
            <article key={c.id} className="flex flex-col gap-4 rounded-[18px] border border-line bg-paper p-[26px]">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-brand-soft px-2.5 py-[5px] text-[13px] font-semibold text-brand-dark">
                  {categoryLabel(categories, c.category)}
                </span>
                <span className="text-[13px] text-muted">{weeksLabel(c.duration_weeks)}</span>
              </div>
              <h3 className="font-display text-[23px] leading-[1.2] font-bold tracking-[-0.02em]">{c.title}</h3>
              <p className="grow text-[15px] leading-relaxed text-body">{c.blurb}</p>
              <div className="flex flex-wrap gap-2 text-[13px]">
                <span className="rounded-lg border border-line bg-white px-2.5 py-1.5">{c.mode}</span>
                <span className="rounded-lg border border-line bg-white px-2.5 py-1.5">Starts {formatDate(c.start_date, "soon")}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5">
                <div className="flex flex-col">
                  <span className="text-xs text-muted">Fee</span>
                  <span className="font-display text-xl font-bold">{formatPrice(c.price, "Coming soon")}</span>
                </div>
                <Link href={`/courses/${c.slug}`} className="btn-primary">
                  View cohort
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
