import { notFound } from "next/navigation";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/action-form";
import { Card, Checkbox, Field, Select, TextArea, TextInput, controlClass } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/page-header";
import { isUuid } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES, type Mentor } from "@/lib/types";
import { deleteMentor, saveMentor } from "../actions";

export const metadata = { title: "Edit mentor" };

export default async function EditMentorPage({ params }: PageProps<"/admin/mentors/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  let m: Partial<Mentor> = { track: "product", published: true, sort_order: 0 };
  if (!isNew) {
    if (!isUuid(id)) notFound();
    const { data } = await supabase.from("mentors").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    m = data as Mentor;
  }
  const s = (v: unknown) => (v == null ? "" : String(v));

  return (
    <>
      <PageHeader title={isNew ? "New mentor" : (m.name ?? "Mentor")} back={{ href: "/admin/mentors", label: "All mentors" }} />
      <ActionForm action={saveMentor}>
        <input type="hidden" name="id" value={isNew ? "" : id} />
        <input type="hidden" name="photo_url" value={s(m.photo_url)} />
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Name" name="name" required defaultValue={s(m.name)} />
            <Select label="Track" name="track" defaultValue={s(m.track)} options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} />
            <TextInput label="Role" name="role" defaultValue={s(m.role)} placeholder="Senior Product Manager" />
            <TextInput label="Company" name="company" defaultValue={s(m.company)} />
            <TextInput label="LinkedIn URL" name="linkedin_url" type="url" defaultValue={s(m.linkedin_url)} />
            <TextInput label="Sort order" name="sort_order" type="number" defaultValue={s(m.sort_order)} />
          </div>
          <TextArea label="One-line bio" name="bio" rows={2} defaultValue={s(m.bio)} hint="Shown when this mentor leads a cohort." />
          <div className="flex flex-wrap items-end gap-4">
            {m.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo_url} alt="" className="size-20 rounded-xl object-cover" />
            )}
            <Field label="Photo" hint="JPG, PNG or WebP, up to 4 MB." className="flex-1">
              <input type="file" name="photo" accept="image/*" className={controlClass} />
            </Field>
          </div>
          {m.photo_url && <Checkbox label="Remove current photo" name="remove_photo" />}
          <Checkbox label="Published" name="published" defaultChecked={m.published} hint="Show on the public site." />
        </Card>
        <div>
          <SubmitButton>{isNew ? "Create mentor" : "Save changes"}</SubmitButton>
        </div>
      </ActionForm>
      {!isNew && (
        <Card title="Danger zone">
          <ConfirmButton action={deleteMentor} id={id} label="Delete mentor" />
        </Card>
      )}
    </>
  );
}
