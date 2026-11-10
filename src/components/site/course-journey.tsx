import Link from "next/link";
import { Fragment } from "react";
import { formatDate, weeksLabel } from "@/lib/format";
import { categoryLabel, type CategoryItem, type Course } from "@/lib/types";

/** The career journey shown in the Programs section, in order. Ids match the `categories` table. */
export const JOURNEY: { id: string; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "engineering", label: "Engineering" },
  { id: "operations", label: "Operations" },
  { id: "marketing", label: "Marketing" },
  { id: "creative", label: "Creative" },
];

function StepArrow() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center text-brand lg:px-1">
      <svg className="rotate-90 lg:rotate-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

export function CourseJourney({ courses, categories }: { courses: Course[]; categories: CategoryItem[] }) {
  const journeyIds = new Set(JOURNEY.map((s) => s.id));
  const others = courses.filter((c) => !journeyIds.has(c.category));

  return (
    <div className="flex flex-col gap-8">
      <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
        {JOURNEY.map((step, i) => {
          const stepCourses = courses.filter((c) => c.category === step.id);
          return (
            <Fragment key={step.id}>
              {i > 0 && <StepArrow />}
              <li className="flex min-w-0 flex-1 flex-col gap-4 rounded-[18px] border border-line bg-paper p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg font-bold tracking-[-0.01em]">{categoryLabel(categories, step.id) || step.label}</h3>
                </div>
                {stepCourses.length === 0 ? (
                  <span className="self-start rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold text-muted">Coming soon</span>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {stepCourses.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/courses/${c.slug}`}
                          className="flex flex-col gap-0.5 rounded-xl border border-line bg-white p-3 no-underline transition-colors hover:border-brand"
                        >
                          <span className="text-[15px] leading-snug font-semibold text-ink">{c.title}</span>
                          <span className="text-xs text-muted">
                            {weeksLabel(c.duration_weeks)} · Starts {formatDate(c.start_date, "soon")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>

      {others.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-muted">More programs</span>
          <div className="flex flex-wrap gap-2">
            {others.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                className="rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-medium text-ink no-underline hover:border-ink"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
