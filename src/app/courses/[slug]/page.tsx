import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm, ApplyLabel, BatchChooser, BatchProvider } from "@/components/site/batch-picker";
import { Check, Chevron } from "@/components/site/icons";
import { LeadForm } from "@/components/site/lead-form";
import { SiteHeader } from "@/components/site/site-header";
import { getCourseBySlug, getCourses, getSettings } from "@/lib/data";
import { formatDate, formatPrice, weeksLabel } from "@/lib/format";
import type { ProjectAccent } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Program not found" };
  return { title: course.title, description: course.blurb || course.description };
}

const ACCENTS: Record<ProjectAccent, string> = {
  blue: "bg-brand-soft text-brand-dark",
  yellow: "bg-sun-soft text-sun-ink",
  green: "bg-leaf-soft text-leaf-ink",
};

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const [course, settings] = await Promise.all([getCourseBySlug(slug), getSettings()]);
  if (!course) notFound();

  const { modules, projects, batches, week_plan: week, lead_mentor: mentor, outcomes } = course;
  const nav = [
    modules.length > 0 && { href: "#curriculum", label: "Curriculum" },
    projects.length > 0 && { href: "#projects", label: "Projects" },
    (week.length > 0 || mentor) && { href: "#schedule", label: "Schedule" },
    { href: "#fee", label: "Fee" },
  ].filter(Boolean) as { href: string; label: string }[];

  const facts = [
    { label: "Duration", value: weeksLabel(course.duration_weeks) },
    { label: "Format", value: course.format },
    { label: "Effort", value: course.effort },
    { label: "Batch size", value: course.batch_size ? `${course.batch_size} learners` : "Small batch" },
  ];
  const footnote = ["EMI available", course.seats_left != null ? `${course.seats_left} seats left` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <BatchProvider batches={batches}>
      <div className="min-h-screen bg-paper">
        <SiteHeader links={nav} cta={{ href: "#fee", label: "Apply for this cohort" }} />

        {/* Hero */}
        <section className="bg-ink text-white">
          <div className="container-page flex flex-wrap items-start gap-10 pt-12 pb-16 sm:pt-14">
            <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-[22px]">
              <Link href="/#courses" className="text-sm text-mist no-underline hover:text-white">
                ← All programs
              </Link>
              <span className="self-start rounded-full bg-sun px-3 py-1.5 text-[13px] font-semibold text-ink">
                Live cohort · Admissions open
              </span>
              <h1 className="font-display text-[38px] leading-[1.05] font-bold tracking-[-0.035em] sm:text-[54px]">{course.title}</h1>
              <p className="max-w-[620px] text-lg leading-[1.65] text-mist">{course.description || course.blurb}</p>
              <div className="flex flex-wrap gap-3">
                {facts.map((f) => (
                  <div key={f.label} className="flex flex-col gap-0.5 rounded-xl bg-night px-[18px] py-3.5">
                    <span className="text-xs text-mist">{f.label}</span>
                    <span className="text-base font-bold">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrol card */}
            <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-[18px] rounded-[20px] bg-white p-[26px] text-ink">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted">Next cohort starts</span>
                <span className="font-display text-[26px] font-bold">{formatDate(course.start_date)}</span>
                {course.applications_close && (
                  <span className="text-[13px] text-muted">Applications close {formatDate(course.applications_close)}</span>
                )}
              </div>
              <BatchChooser />
              <div className="flex items-baseline justify-between border-t border-line pt-3.5">
                <span className="text-sm text-muted">Program fee</span>
                <span className="font-display text-2xl font-bold">{formatPrice(course.price)}</span>
              </div>
              <a href="#fee" className="btn-primary rounded-xl py-[15px] text-base font-bold">
                <ApplyLabel fallback="Apply now" />
              </a>
              <a href="#call" className="btn-outline rounded-xl py-[13px]">
                Talk to a counsellor
              </a>
              <span className="text-center text-[13px] text-muted">{footnote}</span>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        {outcomes.length > 0 && (
          <section className="container-page flex flex-col gap-8 py-16 sm:py-20">
            <h2 className="font-display text-[30px] leading-[1.12] font-bold tracking-[-0.03em] sm:text-[38px]">
              By the end of the cohort you&apos;ll be able to
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
              {outcomes.map((o) => (
                <div key={o} className="flex items-start gap-3.5 rounded-[14px] border border-line bg-white p-5">
                  <Check />
                  <span className="text-[15px] leading-[1.55]">{o}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Curriculum */}
        {modules.length > 0 && (
          <section id="curriculum" className="scroll-mt-20 border-y border-line bg-white">
            <div className="container-page flex flex-wrap gap-12 py-16 sm:py-20">
              <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
                <span className="eyebrow">Curriculum</span>
                <h2 className="font-display text-[30px] leading-[1.12] font-bold tracking-[-0.03em] sm:text-[38px]">
                  {course.duration_weeks ? `${course.duration_weeks} weeks, ` : ""}
                  {modules.length} modules
                </h2>
                <p className="text-base leading-relaxed text-body">
                  Each module mixes live classes, a hands-on assignment and a mentor review.
                </p>
                {course.syllabus_url && (
                  <a href={course.syllabus_url} className="self-start py-3 text-[15px] font-semibold">
                    Download full syllabus →
                  </a>
                )}
              </div>
              <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-3">
                {modules.map((m, i) => (
                  <details key={m.id ?? i} className="rounded-[14px] border border-line bg-paper px-[22px]">
                    <summary className="flex items-center gap-4 py-5">
                      {m.weeks_label && (
                        <span className="rounded-lg bg-brand-soft px-2.5 py-[5px] text-[13px] font-semibold whitespace-nowrap text-brand-dark">
                          {m.weeks_label}
                        </span>
                      )}
                      <span className="flex-1 text-[17px] font-semibold">{m.title}</span>
                      <Chevron />
                    </summary>
                    <div className="flex flex-col gap-2.5 pb-5">
                      {m.topics && <p className="text-[15px] leading-relaxed text-body">{m.topics}</p>}
                      {m.assignment && (
                        <p className="text-sm leading-normal">
                          <strong>Assignment:</strong> {m.assignment}
                        </p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section id="projects" className="container-page flex scroll-mt-20 flex-col gap-8 py-16 sm:py-20">
            <div className="flex max-w-[680px] flex-col gap-2.5">
              <span className="eyebrow">Portfolio</span>
              <h2 className="font-display text-[30px] leading-[1.12] font-bold tracking-[-0.03em] sm:text-[38px]">
                Projects you&apos;ll take into interviews
              </h2>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
              {projects.map((p, i) => (
                <div key={p.id ?? i} className="flex flex-col overflow-hidden rounded-[18px] border border-line bg-white">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-40 w-full object-cover" />
                  ) : (
                    <div className={`flex h-40 items-center justify-center font-display text-lg font-bold ${ACCENTS[p.accent] ?? ACCENTS.blue}`}>
                      {p.title}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 p-[22px]">
                    <h3 className="font-display text-xl font-bold">{p.title}</h3>
                    <p className="text-[15px] leading-relaxed text-body">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Schedule + mentor */}
        {(week.length > 0 || mentor) && (
          <section id="schedule" className="scroll-mt-20 border-y border-line bg-white">
            <div className="container-page flex flex-wrap gap-10 py-16 sm:py-20">
              {week.length > 0 && (
                <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-5">
                  <h2 className="font-display text-[30px] font-bold tracking-[-0.03em] sm:text-[34px]">A typical week</h2>
                  <div className="overflow-hidden rounded-[14px] border border-line">
                    {week.map((w, i) => (
                      <div key={w.id ?? i} className="flex gap-4 border-b border-line-soft px-5 py-4 last:border-b-0">
                        <span className="w-[110px] shrink-0 text-[15px] font-bold">{w.day_label}</span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[15px] font-semibold">{w.activity}</span>
                          <span className="text-[13px] text-muted">{w.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {mentor && (
                <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-5">
                  <h2 className="font-display text-[30px] font-bold tracking-[-0.03em] sm:text-[34px]">Lead mentor</h2>
                  <div className="flex items-center gap-[18px] rounded-[18px] border border-line bg-paper p-6">
                    {mentor.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mentor.photo_url} alt={mentor.name} className="size-[88px] shrink-0 rounded-full object-cover" style={{ objectPosition: `50% ${mentor.photo_position_y ?? 50}%` }} />
                    ) : (
                      <div className="flex size-[88px] shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-dark">
                        Photo
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-xl font-bold">{mentor.name}</span>
                      <span className="text-sm text-muted">
                        {mentor.role}
                        {mentor.company && ` · ${mentor.company}`}
                      </span>
                      {mentor.bio && <span className="text-sm leading-normal text-body">{mentor.bio}</span>}
                    </div>
                  </div>
                  {course.guest_mentors_note && <p className="text-sm text-muted">{course.guest_mentors_note}</p>}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Fee / application */}
        <section id="fee" className="container-page scroll-mt-20 py-16 sm:py-20">
          <div className="flex flex-wrap items-center justify-between gap-8 rounded-3xl bg-brand px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
              <h2 className="font-display text-[30px] font-bold tracking-[-0.03em] sm:text-4xl">Reserve your seat</h2>
              <p className="text-[17px] leading-relaxed text-brand-tint">
                Fill a short application. Our team will call you within 24 hours to confirm fit and share payment and EMI options.
              </p>
              <div className="flex flex-wrap gap-2.5 text-sm">
                <Pill>Fee: {formatPrice(course.price)}</Pill>
                {course.emi_from != null && <Pill>EMI from {formatPrice(course.emi_from)}/month</Pill>}
                {course.dubuddy_discount != null && course.dubuddy_discount > 0 && (
                  <Pill>DUBuddy users: {course.dubuddy_discount}% off</Pill>
                )}
              </div>
            </div>
            <ApplicationForm courseId={course.id} />
          </div>
        </section>

        {/* Counsellor */}
        <section id="call" className="container-page scroll-mt-20 pb-16 sm:pb-20">
          <div className="flex flex-wrap items-center justify-between gap-8 rounded-3xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
              <h2 className="font-display text-[28px] font-bold tracking-[-0.03em] sm:text-[32px]">Questions before you apply?</h2>
              <p className="text-[17px] leading-relaxed text-mist">
                Leave your number and a counsellor will call you back about the {course.short_title || course.title} cohort.
              </p>
            </div>
            <LeadForm courseId={course.id} />
          </div>
        </section>

        <footer className="border-t border-line bg-white px-6 py-5 text-center text-[13px] text-muted">
          © {new Date().getFullYear()} {settings.company_name || "Cyberflow Tech Private Limited"} ·{" "}
          <Link href="/">Back to SkillBuddy home</Link>
        </footer>
      </div>
    </BatchProvider>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-lg bg-white/15 px-3 py-2">{children}</span>;
}
