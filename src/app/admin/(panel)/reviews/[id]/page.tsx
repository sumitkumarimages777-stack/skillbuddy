import { notFound } from "next/navigation";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/action-form";
import { Card, Checkbox, Field, Select, TextArea, TextInput, controlClass } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/page-header";
import { isUuid } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth";
import type { Review } from "@/lib/types";
import { deleteReview, saveReview } from "../actions";

export const metadata = { title: "Edit review" };

export default async function EditReviewPage({ params }: PageProps<"/admin/reviews/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  let r: Partial<Review> = { published: true, sort_order: 0 };
  if (!isNew) {
    if (!isUuid(id)) notFound();
    const { data } = await supabase.from("reviews").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    r = data as Review;
  }
  const { data: courses } = await supabase.from("courses").select("id, title").order("sort_order");
  const s = (v: unknown) => (v == null ? "" : String(v));

  return (
    <>
      <PageHeader title={isNew ? "New review" : `Review by ${r.learner_name}`} back={{ href: "/admin/reviews", label: "All reviews" }} />
      <ActionForm action={saveReview}>
        <input type="hidden" name="id" value={isNew ? "" : id} />
        <input type="hidden" name="photo_url" value={s(r.photo_url)} />
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Learner name" name="learner_name" required defaultValue={s(r.learner_name)} />
            <Select
              label="Cohort"
              name="course_id"
              defaultValue={s(r.course_id)}
              options={[{ value: "", label: "— None —" }, ...(courses ?? []).map((c) => ({ value: c.id as string, label: c.title as string }))]}
            />
            <TextInput label="College" name="college" defaultValue={s(r.college)} />
            <TextInput label="Sort order" name="sort_order" type="number" defaultValue={s(r.sort_order)} />
            <TextInput label="Role landed" name="outcome_role" defaultValue={s(r.outcome_role)} placeholder="Associate PM" />
            <TextInput label="Company" name="outcome_company" defaultValue={s(r.outcome_company)} />
          </div>
          <TextArea label="Quote" name="quote" required rows={4} defaultValue={s(r.quote)} />
          <div className="flex flex-wrap items-end gap-4">
            {r.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.photo_url} alt="" className="size-16 rounded-full object-cover" />
            )}
            <Field label="Photo (optional)" className="flex-1">
              <input type="file" name="photo" accept="image/*" className={controlClass} />
            </Field>
          </div>
          {r.photo_url && <Checkbox label="Remove current photo" name="remove_photo" />}
          <Checkbox label="Published" name="published" defaultChecked={r.published} />
        </Card>
        <div>
          <SubmitButton>{isNew ? "Create review" : "Save changes"}</SubmitButton>
        </div>
      </ActionForm>
      {!isNew && (
        <Card title="Danger zone">
          <ConfirmButton action={deleteReview} id={id} label="Delete review" />
        </Card>
      )}
    </>
  );
}
