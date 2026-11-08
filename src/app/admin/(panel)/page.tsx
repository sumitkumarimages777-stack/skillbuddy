import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import type { Application, Lead } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, profile } = await requireAdmin();
  const count = (table: string, filter?: [string, string | boolean]) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return q;
  };

  const [newApps, totalApps, newLeads, liveCourses, mentors, recentApps, recentLeads] = await Promise.all([
    count("applications", ["status", "new"]),
    count("applications"),
    count("leads", ["status", "new"]),
    count("courses", ["published", true]),
    count("mentors", ["published", true]),
    supabase.from("applications").select("*, course:courses(title)").order("created_at", { ascending: false }).limit(6),
    supabase.from("leads").select("*, course:courses(title)").order("created_at", { ascending: false }).limit(6),
  ]);

  const stats = [
    { label: "New applications", value: newApps.count ?? 0, href: "/admin/applications?status=new", highlight: true },
    { label: "All applications", value: totalApps.count ?? 0, href: "/admin/applications" },
    { label: "New call-back leads", value: newLeads.count ?? 0, href: "/admin/leads?status=new", highlight: true },
    { label: "Live courses", value: liveCourses.count ?? 0, href: "/admin/courses" },
    { label: "Published mentors", value: mentors.count ?? 0, href: "/admin/mentors" },
  ];

  return (
    <>
      <PageHeader title={`Hi${profile.full_name ? `, ${profile.full_name}` : ""} 👋`} description="Here's what's happening on SkillBuddy." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-4 text-ink no-underline hover:border-line-strong">
            <span className={`font-display text-3xl font-bold ${s.highlight && s.value > 0 ? "text-brand" : ""}`}>{s.value}</span>
            <span className="text-xs text-muted">{s.label}</span>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Recent
          title="Latest applications"
          href="/admin/applications"
          items={((recentApps.data ?? []) as Application[]).map((a) => ({
            id: a.id,
            name: a.full_name,
            sub: `${a.course?.title ?? "—"}${a.batch_name ? ` · ${a.batch_name}` : ""}`,
            status: a.status,
            at: a.created_at,
          }))}
        />
        <Recent
          title="Latest call-back requests"
          href="/admin/leads"
          items={((recentLeads.data ?? []) as Lead[]).map((l) => ({
            id: l.id,
            name: l.name,
            sub: `${l.phone} · ${l.course?.title ?? "General enquiry"}`,
            status: l.status,
            at: l.created_at,
          }))}
        />
      </div>
    </>
  );
}

function Recent({ title, href, items }: { title: string; href: string; items: { id: string; name: string; sub: string; status: string; at: string }[] }) {
  return (
    <section className="flex flex-col rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <Link href={href} className="text-sm font-semibold">
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted">Nothing yet.</p>
      ) : (
        <ul>
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3 last:border-0">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{i.name}</span>
                <span className="truncate text-xs text-muted">
                  {i.sub} · {formatDateTime(i.at)}
                </span>
              </div>
              <StatusBadge status={i.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
