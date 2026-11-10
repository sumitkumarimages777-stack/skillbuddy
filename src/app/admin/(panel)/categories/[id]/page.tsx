import { notFound } from "next/navigation";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/action-form";
import { Card, TextInput } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import type { CategoryItem } from "@/lib/types";
import { deleteCategory, saveCategory } from "../actions";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params, searchParams }: PageProps<"/admin/categories/[id]">) {
  const { id: rawId } = await params;
  const sp = await searchParams;
  const id = decodeURIComponent(rawId);
  const { supabase } = await requireAdmin();
  const isNew = id === "new";

  let c: Partial<CategoryItem> = { sort_order: 0 };
  let usage = { mentors: 0, courses: 0 };
  if (!isNew) {
    const { data } = await supabase.from("categories").select("id, label, sort_order").eq("id", id).maybeSingle();
    if (!data) notFound();
    c = data as CategoryItem;
    const [m, k] = await Promise.all([
      supabase.from("mentors").select("id", { count: "exact", head: true }).eq("track", id),
      supabase.from("courses").select("id", { count: "exact", head: true }).eq("category", id),
    ]);
    usage = { mentors: m.count ?? 0, courses: k.count ?? 0 };
  }
  const s = (v: unknown) => (v == null ? "" : String(v));

  return (
    <>
      <PageHeader title={isNew ? "New category" : (c.label ?? "Category")} back={{ href: "/admin/categories", label: "All categories" }} />
      <ActionForm action={saveCategory}>
        <input type="hidden" name="id" value={isNew ? "" : id} />
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Name" name="label" required maxLength={60} defaultValue={s(c.label)} placeholder="Finance" />
            <TextInput
              label="Slug"
              name="slug"
              maxLength={40}
              defaultValue={s(c.id)}
              hint={isNew ? "Leave blank to generate from the name." : "Changing it updates all linked courses and mentors."}
            />
            <TextInput label="Sort order" name="sort_order" type="number" defaultValue={s(c.sort_order)} />
          </div>
        </Card>
        <div>
          <SubmitButton>{isNew ? "Create category" : "Save changes"}</SubmitButton>
        </div>
      </ActionForm>
      {!isNew && (
        <Card title="Danger zone">
          {sp.error === "in-use" && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              Couldn&apos;t delete this category.
            </p>
          )}
          {usage.mentors + usage.courses > 0 ? (
            <p className="text-sm text-body">
              In use by {usage.courses} course{usage.courses === 1 ? "" : "s"} and {usage.mentors} mentor{usage.mentors === 1 ? "" : "s"}. Move them
              to another category before deleting this one.
            </p>
          ) : (
            <ConfirmButton action={deleteCategory} id={id} label="Delete category" />
          )}
        </Card>
      )}
    </>
  );
}
