import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { loadCategories } from "@/lib/admin/categories";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const [categories, mentors, courses] = await Promise.all([
    loadCategories(supabase),
    supabase.from("mentors").select("track"),
    supabase.from("courses").select("category"),
  ]);
  const count = (id: string) => ({
    mentors: (mentors.data ?? []).filter((m) => m.track === id).length,
    courses: (courses.data ?? []).filter((c) => c.category === id).length,
  });

  return (
    <>
      <PageHeader
        title="Categories"
        description="Tracks used for courses and mentors, and as filters on the home page."
        actions={<Link href="/admin/categories/new" className="btn-primary">+ New category</Link>}
      />
      {categories.length === 0 ? (
        <EmptyState>No categories yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((c) => {
            const n = count(c.id);
            return (
              <Link
                key={c.id}
                href={`/admin/categories/${encodeURIComponent(c.id)}`} prefetch
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 text-ink no-underline hover:border-line-strong"
              >
                <span className="flex flex-col">
                  <span className="font-semibold">{c.label}</span>
                  <span className="text-xs text-muted">{c.id}</span>
                </span>
                <span className="text-sm text-muted">
                  {n.courses} course{n.courses === 1 ? "" : "s"} · {n.mentors} mentor{n.mentors === 1 ? "" : "s"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
