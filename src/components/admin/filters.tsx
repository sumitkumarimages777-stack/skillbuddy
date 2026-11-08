import { controlClass } from "./fields";

/** GET form for filtering list pages via search params. */
export function Filters({
  statuses,
  courses,
  status,
  course,
  exportHref,
}: {
  statuses: readonly string[];
  courses: { id: string; title: string }[];
  status?: string;
  course?: string;
  exportHref: string;
}) {
  const qs = new URLSearchParams({ ...(status ? { status } : {}), ...(course ? { course } : {}) }).toString();
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4">
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
        Status
        <select name="status" defaultValue={status ?? ""} className={`${controlClass} w-auto capitalize`}>
          <option value="">All</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
        Cohort
        <select name="course" defaultValue={course ?? ""} className={`${controlClass} w-auto`}>
          <option value="">All cohorts</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <button className="btn-outline">Filter</button>
      <a href={`${exportHref}${qs ? `?${qs}` : ""}`} className="btn-outline ml-auto">
        Export CSV
      </a>
    </form>
  );
}
