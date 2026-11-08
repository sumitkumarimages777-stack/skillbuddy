import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/site/icons";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  const notAdmin = sp.error === "not-admin";

  let email: string | null = null;
  if (isSupabaseConfigured && notAdmin) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    email = (data?.claims?.email as string | undefined) ?? null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-line bg-white p-6 shadow-[0_20px_40px_-24px_rgba(15,18,34,0.25)] sm:p-8">
        <Link href="/" className="text-ink no-underline">
          <Logo />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold">Admin panel</h1>
          <p className="text-sm text-muted">Sign in to manage cohorts, mentors and applications.</p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="flex flex-col gap-2 rounded-xl bg-sun-soft p-4 text-sm text-sun-ink">
            <strong>Supabase isn&apos;t connected yet.</strong>
            <span>
              Copy <code>.env.example</code> to <code>.env.local</code>, add your project URL and publishable key, then restart the
              dev server. See the README for the full setup.
            </span>
          </div>
        ) : notAdmin ? (
          <div className="flex flex-col gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800">
            <span>
              {email ? <strong>{email}</strong> : "This account"} is signed in but doesn&apos;t have admin access. Ask an existing
              admin to grant it, or sign in with a different account.
            </span>
            <form action={signOut}>
              <button className="btn-outline">Sign out</button>
            </form>
          </div>
        ) : (
          <LoginForm next={next} />
        )}
      </div>
    </main>
  );
}
