import { isUuid } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth";

const COLUMNS = {
  applications: ["created_at", "full_name", "phone", "college_year", "course", "batch_name", "status", "notes"],
  leads: ["created_at", "name", "phone", "source", "course", "status", "notes"],
} as const;

function csvCell(v: unknown) {
  let s = v == null ? "" : String(v);
  // Neutralise spreadsheet formulas in user-submitted text (plain phone numbers are left alone).
  if (/^[=+\-@\t\r]/.test(s) && !/^\+?[\d\s()-]+$/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV download of applications or leads, honouring the same filters as the list page. */
export async function GET(request: Request, { params }: RouteContext<"/admin/export/[kind]">) {
  const { kind } = await params;
  if (kind !== "applications" && kind !== "leads") return new Response("Not found", { status: 404 });
  const { supabase } = await requireAdmin();

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const course = url.searchParams.get("course");
  let q = supabase.from(kind).select("*, course:courses(title)").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  if (isUuid(course)) q = q.eq("course_id", course);
  const { data, error } = await q;
  if (error) return new Response(error.message, { status: 500 });

  const cols = COLUMNS[kind];
  const lines = [
    cols.join(","),
    ...(data ?? []).map((row: Record<string, unknown>) =>
      cols.map((c) => csvCell(c === "course" ? (row.course as { title?: string } | null)?.title : row[c])).join(","),
    ),
  ];
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="skillbuddy-${kind}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
