import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, description, back, actions }: { title: string; description?: string; back?: { href: string; label: string }; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {back && (
        <Link href={back.href} className="text-sm text-muted no-underline hover:text-ink">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em]">{title}</h1>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    new: "bg-brand-soft text-brand-dark",
    contacted: "bg-sun-soft text-sun-ink",
    accepted: "bg-leaf-soft text-leaf-ink",
    enrolled: "bg-leaf-soft text-leaf-ink",
    converted: "bg-leaf-soft text-leaf-ink",
    rejected: "bg-red-50 text-red-700",
    closed: "bg-line-soft text-muted",
    published: "bg-leaf-soft text-leaf-ink",
    draft: "bg-line-soft text-muted",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tone[status] ?? "bg-line-soft text-muted"}`}>
      {status}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center text-sm text-muted">{children}</div>;
}
