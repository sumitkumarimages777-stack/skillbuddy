import Link from "next/link";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import type { Review } from "@/lib/types";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("reviews").select("*, course:courses(title, short_title)").order("sort_order").order("created_at");
  const reviews = (data ?? []) as Review[];
  return (
    <>
      <PageHeader
        title="Reviews"
        description="Learner stories on the home page."
        actions={<Link href="/admin/reviews/new" className="btn-primary">+ New review</Link>}
      />
      {reviews.length === 0 ? (
        <EmptyState>No reviews yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <Link key={r.id} href={`/admin/reviews/${r.id}`} prefetch className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 text-ink no-underline hover:border-line-strong">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">
                  {r.learner_name}
                  <span className="font-normal text-muted"> · {r.course?.short_title || r.course?.title || "No course"}</span>
                </span>
                <StatusBadge status={r.published ? "published" : "draft"} />
              </div>
              <p className="line-clamp-2 text-sm text-body">{r.quote}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
