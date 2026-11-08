import Link from "next/link";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { CATEGORIES, type Course } from "@/lib/types";
import { toggleCoursePublished } from "./actions";

export const metadata = { title: "Courses" };

export default async function CoursesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("courses").select("*, applications(count)").order("sort_order").order("created_at");
  const courses = (data ?? []) as (Course & { applications: { count: number }[] })[];

  return (
    <>
      <PageHeader
        title="Courses"
        description="Cohort programs shown on the home page and their own landing pages."
        actions={
          <Link href="/admin/courses/new" className="btn-primary">
            + New course
          </Link>
        }
      />
      {courses.length === 0 ? (
        <EmptyState>No courses yet. Create your first cohort program.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Program</th>
                <th className="px-4 py-3 font-semibold">Starts</th>
                <th className="px-4 py-3 font-semibold">Fee</th>
                <th className="px-4 py-3 font-semibold">Applications</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/courses/${c.id}`} className="font-semibold text-ink no-underline hover:text-brand">
                      {c.title}
                    </Link>
                    <div className="text-xs text-muted">
                      {CATEGORIES.find((x) => x.id === c.category)?.label} · /courses/{c.slug}
                      {c.featured && " · Featured"}
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatDate(c.start_date, "—")}</td>
                  <td className="px-4 py-3">{formatPrice(c.price, "—")}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/applications?course=${c.id}`}>{c.applications?.[0]?.count ?? 0}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleCoursePublished} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="published" value={String(!c.published)} />
                      <StatusBadge status={c.published ? "published" : "draft"} />
                      <button className="text-xs font-semibold text-brand hover:underline">{c.published ? "Unpublish" : "Publish"}</button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/courses/${c.id}`} className="font-semibold">
                      Edit
                    </Link>
                    {c.published && (
                      <a href={`/courses/${c.slug}`} target="_blank" className="ml-4 text-muted">
                        View ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
