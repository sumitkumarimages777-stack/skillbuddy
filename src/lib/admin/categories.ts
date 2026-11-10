import "server-only";
import type { requireAdmin } from "@/lib/auth";
import { DEFAULT_CATEGORIES, type CategoryItem } from "@/lib/types";

type Admin = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/** All categories, for admin dropdowns and lists. */
export async function loadCategories(supabase: Admin): Promise<CategoryItem[]> {
  const { data } = await supabase.from("categories").select("id, label, sort_order").order("sort_order").order("label");
  return data && data.length ? (data as CategoryItem[]) : DEFAULT_CATEGORIES;
}

export const categoryOptions = (categories: CategoryItem[]) => categories.map((c) => ({ value: c.id, label: c.label }));
