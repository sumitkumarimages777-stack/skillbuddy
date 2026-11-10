import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/action-form";
import { Card, Checkbox, Select, TextArea, TextInput } from "@/components/admin/fields";
import { ListEditor, StringListEditor } from "@/components/admin/list-editor";
import { PageHeader } from "@/components/admin/page-header";
import { isUuid } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/auth";
import { categoryOptions, loadCategories } from "@/lib/admin/categories";
import { PROJECT_ACCENTS, type CourseDetail, type Mentor } from "@/lib/types";
import { deleteCourse, saveCourse } from "../actions";

export const metadata = { title: "Edit course" };

const byPos = (a: { position?: number }, b: { position?: number }) => (a.position ?? 0) - (b.position ?? 0);

export default async function EditCoursePage({ params, searchParams }: PageProps<"/admin/courses/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";

  let course: Partial<CourseDetail> = {
    format: "Live online, weekends",
    mode: "Live · Weekends",
    effort: "8–10 hrs / week",
    outcomes: [],
    modules: [],
    batches: [
      { name: "Weekend Morning batch", schedule: "Sat & Sun · 10:00 AM – 12:00 PM" },
      { name: "Weekend Evening batch", schedule: "Sat & Sun · 6:00 PM – 8:00 PM" },
    ],
    projects: [],
    week_plan: [],
    published: false,
    sort_order: 0,
  };

  if (!isNew) {
    if (!isUuid(id)) notFound();
    const { data } = await supabase
      .from("courses")
      .select("*, modules:course_modules(*), projects:course_projects(*), batches:course_batches(*), week_plan:course_week_plan(*)")
      .eq("id", id)
      .maybeSingle();
    if (!data) notFound();
    course = data as CourseDetail;
  }
  const [{ data: mentorRows }, categories] = await Promise.all([
    supabase.from("mentors").select("id, name, role, company").order("sort_order"),
    loadCategories(supabase),
  ]);
  const mentors = (mentorRows ?? []) as Pick<Mentor, "id" | "name" | "role" | "company">[];

  const s = (v: unknown) => (v == null ? "" : String(v));
  const rows = <T extends object>(list: T[] | undefined) =>
    [...(list ?? [])].sort(byPos).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, s(v)])));

  return (
    <>
      <PageHeader
        title={isNew ? "New course" : (course.title ?? "Course")}
        back={{ href: "/admin/courses", label: "All courses" }}
        actions={
          !isNew && course.published ? (
            <a href={`/courses/${course.slug}`} target="_blank" className="btn-outline">
              View live page ↗
            </a>
          ) : undefined
        }
      />
      {sp.created && <p className="rounded-lg bg-leaf-soft px-3 py-2 text-sm font-medium text-leaf-ink">Course created.</p>}

      <ActionForm action={saveCourse}>
        <input type="hidden" name="id" value={isNew ? "" : id} />

        <Card title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Title" name="title" required defaultValue={s(course.title)} placeholder="Product Management Cohort" />
            <TextInput label="URL slug" name="slug" defaultValue={s(course.slug)} placeholder="product-management" hint="Leave blank to generate from the title. Page lives at /courses/<slug>." />
            <TextInput label="Short title" name="short_title" defaultValue={s(course.short_title)} placeholder="Product Management" hint="Used in the Upcoming list and footer." />
            <TextInput label="Short code" name="short_code" maxLength={4} defaultValue={s(course.short_code)} placeholder="PM" hint="2–4 letters for the badge." />
            <Select label="Category" name="category" defaultValue={s(course.category ?? categories[0]?.id)} options={categoryOptions(categories)} hint={<Link href="/admin/categories">Manage categories</Link>} />
            <TextInput label="Sort order" name="sort_order" type="number" defaultValue={s(course.sort_order)} hint="Lower numbers show first." />
          </div>
          <TextArea label="Card blurb" name="blurb" rows={2} defaultValue={s(course.blurb)} hint="One or two sentences shown on the program card." />
          <TextArea label="Hero description" name="description" rows={3} defaultValue={s(course.description)} hint="Shown at the top of the cohort page." />
          <div className="flex flex-wrap gap-6">
            <Checkbox label="Published" name="published" defaultChecked={course.published} hint="Visible on the public site." />
            <Checkbox label="Featured" name="featured" defaultChecked={course.featured} hint="Listed under “Upcoming cohorts” on the home page." />
          </div>
        </Card>

        <Card title="Schedule, fee & seats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextInput label="Start date" name="start_date" type="date" defaultValue={s(course.start_date)} />
            <TextInput label="Applications close" name="applications_close" type="date" defaultValue={s(course.applications_close)} />
            <TextInput label="Duration (weeks)" name="duration_weeks" type="number" min={1} defaultValue={s(course.duration_weeks)} />
            <TextInput label="Fee (₹)" name="price" type="number" min={0} defaultValue={s(course.price)} hint="Leave blank to show “To be announced”." />
            <TextInput label="EMI from (₹/month)" name="emi_from" type="number" min={0} defaultValue={s(course.emi_from)} />
            <TextInput label="DUBuddy discount (%)" name="dubuddy_discount" type="number" min={0} max={100} defaultValue={s(course.dubuddy_discount)} />
            <TextInput label="Batch size" name="batch_size" type="number" min={1} defaultValue={s(course.batch_size)} />
            <TextInput label="Seats left" name="seats_left" type="number" min={0} defaultValue={s(course.seats_left)} />
            <TextInput label="Effort" name="effort" defaultValue={s(course.effort)} />
            <TextInput label="Format" name="format" defaultValue={s(course.format)} hint="Hero fact, e.g. “Live online, weekends”." />
            <TextInput label="Mode tag" name="mode" defaultValue={s(course.mode)} hint="Card tag, e.g. “Live · Weekends”." />
            <TextInput label="Syllabus URL" name="syllabus_url" type="url" defaultValue={s(course.syllabus_url)} placeholder="https://…" />
          </div>
        </Card>

        <Card title="Batches" description="Learners pick one when they apply.">
          <ListEditor
            name="batches"
            addLabel="Add batch"
            initial={rows(course.batches)}
            fields={[
              { key: "name", label: "Name", placeholder: "Weekend Morning batch" },
              { key: "schedule", label: "Timing", placeholder: "Sat & Sun · 10:00 AM – 12:00 PM" },
            ]}
          />
        </Card>

        <Card title="Outcomes" description="“By the end of the cohort you'll be able to…”">
          <StringListEditor name="outcomes" initial={course.outcomes ?? []} addLabel="Add outcome" placeholder="Write a PRD engineers can build from" />
        </Card>

        <Card title="Curriculum modules">
          <ListEditor
            name="modules"
            addLabel="Add module"
            initial={rows(course.modules)}
            fields={[
              { key: "weeks_label", label: "Weeks", placeholder: "Week 1–2" },
              { key: "title", label: "Title", placeholder: "What PMs actually do" },
              { key: "topics", label: "Topics", type: "textarea" },
              { key: "assignment", label: "Assignment", wide: true },
            ]}
          />
        </Card>

        <Card title="Portfolio projects">
          <ListEditor
            name="projects"
            addLabel="Add project"
            initial={rows(course.projects)}
            fields={[
              { key: "title", label: "Title" },
              { key: "accent", label: "Colour", type: "select", options: PROJECT_ACCENTS.map((a) => ({ value: a, label: a[0].toUpperCase() + a.slice(1) })) },
              { key: "description", label: "Description", type: "textarea" },
              { key: "image_url", label: "Image URL (optional)", wide: true, placeholder: "https://…" },
            ]}
          />
        </Card>

        <Card title="Typical week">
          <ListEditor
            name="week_plan"
            addLabel="Add day"
            initial={rows(course.week_plan)}
            fields={[
              { key: "day_label", label: "Day", placeholder: "Saturday" },
              { key: "activity", label: "Activity", placeholder: "Live class" },
              { key: "detail", label: "Detail", wide: true, placeholder: "2 hours with your lead mentor" },
            ]}
          />
        </Card>

        <Card title="Mentors">
          <Select
            label="Lead mentor"
            name="lead_mentor_id"
            defaultValue={s(course.lead_mentor_id)}
            options={[{ value: "", label: "— None —" }, ...mentors.map((m) => ({ value: m.id, label: `${m.name} · ${m.role}${m.company ? `, ${m.company}` : ""}` }))]}
          />
          <TextInput label="Guest mentors note" name="guest_mentors_note" defaultValue={s(course.guest_mentors_note)} placeholder="Plus guest sessions from 5 PMs across startups…" />
        </Card>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <SubmitButton>{isNew ? "Create course" : "Save changes"}</SubmitButton>
        </div>
      </ActionForm>

      {!isNew && (
        <Card title="Danger zone" description="Deleting a course removes its modules, batches and projects. Applications are kept but lose the link.">
          <ConfirmButton action={deleteCourse} id={id} label="Delete course" confirm={`Delete “${course.title}”? This can't be undone.`} />
        </Card>
      )}
    </>
  );
}
