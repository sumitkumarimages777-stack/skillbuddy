import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, TextArea, TextInput } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import type { SiteSettings } from "@/lib/types";
import { saveSettings } from "./actions";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const st = (data ?? {}) as Partial<SiteSettings>;
  const s = (v: unknown) => (v == null ? "" : String(v));

  return (
    <>
      <PageHeader title="Site settings" description="Home page copy and company details." />
      <ActionForm action={saveSettings}>
        <Card title="Top announcement bar" description="Leave the text empty to hide the bar.">
          <TextInput label="Text" name="announcement_html" defaultValue={s(st.announcement_html)} hint="You can use <strong>bold</strong>. Other HTML is shown as plain text." />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Link label" name="announcement_link_label" defaultValue={s(st.announcement_link_label)} />
            <TextInput label="Link URL" name="announcement_link_url" type="url" defaultValue={s(st.announcement_link_url)} />
          </div>
        </Card>
        <Card title="Hero">
          <TextInput label="Badge" name="admissions_badge" defaultValue={s(st.admissions_badge)} placeholder="Admissions open for July cohorts" />
          <TextInput label="Headline" name="hero_title" defaultValue={s(st.hero_title)} />
          <TextInput label="Highlighted words" name="hero_highlight" defaultValue={s(st.hero_highlight)} hint="Must appear exactly in the headline; it gets the yellow marker." />
          <TextArea label="Subtitle" name="hero_subtitle" defaultValue={s(st.hero_subtitle)} />
          <TextInput label="Max learners per batch" name="max_batch_size" type="number" min={1} defaultValue={s(st.max_batch_size)} className="sm:w-64" hint="Shown in the dark “Why SkillBuddy” band." />
        </Card>
        <Card title="Company">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput label="Legal name" name="company_name" defaultValue={s(st.company_name)} />
            <TextInput label="Contact email" name="contact_email" type="email" defaultValue={s(st.contact_email)} />
            <TextInput label="Contact phone" name="contact_phone" type="tel" defaultValue={s(st.contact_phone)} />
          </div>
        </Card>
        <div>
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
