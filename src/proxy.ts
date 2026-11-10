import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";
import { VERIFIED_USER_HEADER } from "@/lib/supabase/verified-user";

/**
 * Refreshes the Supabase session on admin routes and sends signed-out
 * visitors to the login page. The verified user id is forwarded to the page
 * so requireAdmin() doesn't have to validate the session a second time.
 * Admin role checks happen server-side in requireAdmin() and in the database (RLS).
 */
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  // Never trust this header from the browser.
  request.headers.delete(VERIFIED_USER_HEADER);
  if (!isSupabaseConfigured) {
    if (isLogin) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let cookiesToSet: { name: string; value: string; options: Parameters<NextResponse["cookies"]["set"]>[2] }[] = [];
  let extraHeaders: Record<string, string> = {};
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet = list;
        extraHeaders = headers;
      },
    },
  });

  // getClaims() validates the JWT; don't run code between client creation and this call.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId && !isLogin) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const headers = new Headers(request.headers);
  headers.delete(VERIFIED_USER_HEADER);
  if (userId) headers.set(VERIFIED_USER_HEADER, userId);
  const response = NextResponse.next({ request: { headers } });
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(extraHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
