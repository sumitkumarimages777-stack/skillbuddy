import { ConfirmButton } from "@/components/admin/action-form";
import { Filters } from "@/components/admin/filters";
import { InboxRowForm } from "@/components/admin/inbox-row-form";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/page-header";
import { isUuid } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { LEAD_STATUSES, type Lead } from "@/lib/types";
import { deleteInboxItem } from "../inbox-actions";

export const metadata = { title: "Call-back leads" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (LEAD_STATUSES as readonly string[]).includes(sp.status) ? sp.status : undefined;
  const course = typeof sp.course === "string" && isUuid(sp.course) ? sp.course : undefined;
  const { supabase } = await requireAdmin();

  let q = supabase.from("leads").select("*, course:courses(title)").order("created_at", { ascending: false }).limit(500);
  if (status) q = q.eq("status", status);
  if (course) q = q.eq("course_id", course);
  const [{ data }, { data: courses }] = await Promise.all([q, supabase.from("courses").select("id, title").order("sort_order")]);
  const leads = (data ?? []) as Lead[];

  return (
    <>
      <PageHeader title="Call-back leads" description="“Request a call back” and “Talk to a counsellor” requests. Newest first." />
      <Filters statuses={LEAD_STATUSES} courses={(courses ?? []) as { id: string; title: string }[]} status={status} course={course} exportHref="/admin/export/leads" />
      {leads.length === 0 ? (
        <EmptyState>No leads match.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">
                    {a.name} <StatusBadge status={a.status} />
                  </span>
                  <span className="text-sm text-body">
                    <a href={`tel:${a.phone}`}>{a.phone}</a> ·{" "}
                    <a href={`https://wa.me/${a.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                    {a.source === "home" ? " · Home page" : " · Cohort page"}
                  </span>
                  <span className="text-xs text-muted">
                    {a.course?.title ?? "General enquiry"}
                     · {formatDateTime(a.created_at)}
                  </span>
                </div>
                <ConfirmButton action={deleteInboxItemFor("leads")} id={a.id} label="Delete" className="text-xs font-semibold text-red-700 hover:underline" />
              </div>
              <InboxRowForm table="leads" id={a.id} status={a.status} notes={a.notes} statuses={LEAD_STATUSES} />
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
