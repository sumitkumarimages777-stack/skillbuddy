import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/site/icons";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../login/actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · SkillBuddy admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile } = await requireAdmin();
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3 lg:flex-col lg:items-start lg:px-5 lg:py-5">
          <Link href="/admin" className="text-ink no-underline">
            <Logo />
          </Link>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold tracking-wide text-brand-dark uppercase">Admin</span>
        </div>
        <AdminNav />
        <div className="hidden flex-col gap-2 border-t border-line p-5 text-sm lg:mt-auto lg:flex">
          <span className="truncate text-muted" title={profile.email ?? ""}>
            {profile.email}
          </span>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className="btn-outline flex-1 px-3 text-sm">
              View site
            </Link>
            <form action={signOut} className="flex-1">
              <button className="btn-outline w-full px-3 text-sm">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">{children}</div>
        <form action={signOut} className="mt-10 lg:hidden">
          <button className="btn-outline w-full">Sign out ({profile.email})</button>
        </form>
      </main>
    </div>
  );
}
