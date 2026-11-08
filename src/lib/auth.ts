import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";

/**
 * Verifies the current visitor is a signed-in admin, or redirects to the login page.
 * Call it at the top of every admin page AND every admin server action.
 */
export const requireAdmin = cache(async () => {
  await connection(); // always render admin pages per request, never from a static cache
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/admin/login?error=not-admin");
  return { supabase, profile };
});
