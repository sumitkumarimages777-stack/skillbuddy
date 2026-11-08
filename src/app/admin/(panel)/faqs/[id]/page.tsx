import { notFound } from "next/navigation";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/action-form";
import { Card, Checkbox, TextArea, TextInput } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/page-header";
import { isUuid } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth";
import type { Faq } from "@/lib/types";
import { deleteFaq, saveFaq } from "../actions";

export const metadata = { title: "Edit FAQ" };

export default async function EditFaqPage({ params }: PageProps<"/admin/faqs/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  let f: Partial<Faq> = { published: true, sort_order: 0 };
  if (!isNew) {
    if (!isUuid(id)) notFound();
    const { data } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    f = data as Faq;
  }
  const s = (v: unknown) => (v == null ? "" : String(v));
  return (
    <>
      <PageHeader title={isNew ? "New FAQ" : "Edit FAQ"} back={{ href: "/admin/faqs", label: "All FAQs" }} />
      <ActionForm action={saveFaq}>
        <input type="hidden" name="id" value={isNew ? "" : id} />
        <Card>
          <TextInput label="Question" name="question" required defaultValue={s(f.question)} />
          <TextArea label="Answer" name="answer" required rows={5} defaultValue={s(f.answer)} />
          <div className="flex flex-wrap items-end gap-6">
            <TextInput label="Sort order" name="sort_order" type="number" defaultValue={s(f.sort_order)} className="w-32" />
            <Checkbox label="Published" name="published" defaultChecked={f.published} />
          </div>
        </Card>
        <div>
          <SubmitButton>{isNew ? "Create FAQ" : "Save changes"}</SubmitButton>
        </div>
      </ActionForm>
      {!isNew && (
        <Card title="Danger zone">
          <ConfirmButton action={deleteFaq} id={id} label="Delete FAQ" />
        </Card>
      )}
    </>
  );
}
