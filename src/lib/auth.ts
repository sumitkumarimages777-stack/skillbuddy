import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";
import { VERIFIED_USER_HEADER } from "./supabase/verified-user";

/**
 * Verifies the current visitor is a signed-in admin, or redirects to the login page.
 * Call it at the top of every admin page AND every admin server action.
 */
export const requireAdmin = cache(async () => {
  await connection(); // always render admin pages per request, never from a static cache
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createClient();
  // The proxy has already validated the session on /admin routes; reuse its result.
  // (Even if this header were forged, the profile query below runs under the
  // visitor's real session and RLS only returns their own row.)
  const userId = (await headers()).get(VERIFIED_USER_HEADER) ?? (await supabase.auth.getClaims()).data?.claims?.sub;
  if (!userId) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/admin/login?error=not-admin");
  return { supabase, profile };
});
