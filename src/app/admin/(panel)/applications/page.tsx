import { ConfirmButton } from "@/components/admin/action-form";
import { Filters } from "@/components/admin/filters";
import { InboxRowForm } from "@/components/admin/inbox-row-form";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/page-header";
import { isUuid } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { APPLICATION_STATUSES, type Application } from "@/lib/types";
import { deleteInboxItem } from "../inbox-actions";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/applications">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (APPLICATION_STATUSES as readonly string[]).includes(sp.status) ? sp.status : undefined;
  const course = typeof sp.course === "string" && isUuid(sp.course) ? sp.course : undefined;
  const { supabase } = await requireAdmin();

  let q = supabase.from("applications").select("*, course:courses(title)").order("created_at", { ascending: false }).limit(500);
  if (status) q = q.eq("status", status);
  if (course) q = q.eq("course_id", course);
  const [{ data }, { data: courses }] = await Promise.all([q, supabase.from("courses").select("id, title").order("sort_order")]);
  const apps = (data ?? []) as Application[];

  return (
    <>
      <PageHeader title="Applications" description="“Reserve your seat” submissions from cohort pages. Newest first." />
      <Filters statuses={APPLICATION_STATUSES} courses={(courses ?? []) as { id: string; title: string }[]} status={status} course={course} exportHref="/admin/export/applications" />
      {apps.length === 0 ? (
        <EmptyState>No applications match.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">
                    {a.full_name} <StatusBadge status={a.status} />
                  </span>
                  <span className="text-sm text-body">
                    <a href={`tel:${a.phone}`}>{a.phone}</a> ·{" "}
                    <a href={`https://wa.me/${a.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                    {a.college_year && ` · ${a.college_year}`}
                  </span>
                  <span className="text-xs text-muted">
                    {a.course?.title ?? "Deleted course"}
                    {a.batch_name && ` · ${a.batch_name}`} · {formatDateTime(a.created_at)}
                  </span>
                </div>
                <ConfirmButton action={deleteInboxItemFor("applications")} id={a.id} label="Delete" className="text-xs font-semibold text-red-700 hover:underline" />
              </div>
              <InboxRowForm table="applications" id={a.id} status={a.status} notes={a.notes} statuses={APPLICATION_STATUSES} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function deleteInboxItemFor(table: "applications" | "leads") {
  return async (fd: FormData) => {
    "use server";
    fd.set("table", table);
    await deleteInboxItem(fd);
  };
}
