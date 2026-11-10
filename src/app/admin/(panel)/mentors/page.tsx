import Link from "next/link";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { loadCategories } from "@/lib/admin/categories";
import { categoryLabel, type Mentor } from "@/lib/types";

export const metadata = { title: "Mentors" };

export default async function MentorsPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, categories] = await Promise.all([
    supabase.from("mentors").select("*").order("sort_order").order("created_at"),
    loadCategories(supabase),
  ]);
  const mentors = (data ?? []) as Mentor[];
  return (
    <>
      <PageHeader
        title="Mentors"
        description="Shown in the Mentors section and as lead mentor on cohort pages."
        actions={<Link href="/admin/mentors/new" className="btn-primary">+ New mentor</Link>}
      />
      {mentors.length === 0 ? (
        <EmptyState>No mentors yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
          {mentors.map((m) => (
            <Link key={m.id} href={`/admin/mentors/${m.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-ink no-underline hover:border-line-strong">
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo_url} alt="" className="size-12 rounded-full object-cover" style={{ objectPosition: `50% ${m.photo_position_y ?? 50}%` }} />
              ) : (
                <div className="size-12 shrink-0 rounded-full bg-brand-soft" />
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{m.name}</span>
                <span className="truncate text-xs text-muted">
                  {m.role}
                  {m.company && ` · ${m.company}`} · {categoryLabel(categories, m.track)}
                </span>
              </div>
              <StatusBadge status={m.published ? "published" : "draft"} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
