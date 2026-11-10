import Link from "next/link";
import { EmptyState, PageHeader, StatusBadge } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import type { Faq } from "@/lib/types";

export const metadata = { title: "FAQs" };

export default async function FaqsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("faqs").select("*").order("sort_order").order("created_at");
  const faqs = (data ?? []) as Faq[];
  return (
    <>
      <PageHeader title="FAQs" description="“Still have questions?” on the home page." actions={<Link href="/admin/faqs/new" className="btn-primary">+ New FAQ</Link>} />
      {faqs.length === 0 ? (
        <EmptyState>No FAQs yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <Link key={f.id} href={`/admin/faqs/${f.id}`} prefetch className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-4 text-ink no-underline hover:border-line-strong">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{f.question}</span>
                <StatusBadge status={f.published ? "published" : "draft"} />
              </div>
              <p className="line-clamp-1 text-sm text-body">{f.answer}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
