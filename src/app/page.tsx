import Link from "next/link";
import { CourseGrid } from "@/components/site/course-grid";
import { ArrowRight, Chevron } from "@/components/site/icons";
import { LeadForm } from "@/components/site/lead-form";
import { Highlighted, LimitedHtml } from "@/components/site/rich-text";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getCategories, getCourses, getFaqs, getMentors, getReviews, getSettings } from "@/lib/data";
import { formatDate, weeksLabel } from "@/lib/format";
import { categoryLabel } from "@/lib/types";

// Rebuilt at most once a minute; admin saves revalidate immediately.
export const revalidate = 60;

const STEPS = [
  { title: "Live weekend classes", body: "Interactive sessions on Saturdays and Sundays, so they fit around college. Recordings available if you miss one." },
  { title: "Weekly assignments", body: "Hands-on tasks with deadlines and peer groups — the same kind of work you'd do on the job." },
  { title: "Mentor feedback", body: "Practitioners from the industry review your projects, run doubt sessions and help you sharpen your portfolio." },
  { title: "Interview prep & jobs", body: "Mock interviews, resume reviews and access to internship and job openings shared with the cohort." },
];

export default async function HomePage() {
  const [settings, courses, mentors, reviews, faqs, categories] = await Promise.all([
    getSettings(),
    getCourses(),
    getMentors(),
    getReviews(),
    getFaqs(),
    getCategories(),
  ]);
  const featured = courses.filter((c) => c.featured).slice(0, 4);
  const upcoming = featured.length ? featured : courses.slice(0, 4);

  return (
    <div className="min-h-screen bg-paper">
      {settings.announcement_html && (
        <div className="bg-ink px-4 py-2.5 text-center text-[13px] text-white">
          <LimitedHtml html={settings.announcement_html} />{" "}
          {settings.announcement_link_url && (
            <a href={settings.announcement_link_url} className="font-semibold text-sun hover:text-sun">
              {settings.announcement_link_label || "Learn more"}
            </a>
          )}
        </div>
      )}

      <SiteHeader
        showLogin
        homeHref="#top"
        cta={{ href: "#courses", label: "Apply now" }}
        links={[
          { href: "#mentors", label: "Mentors" },
          { href: "#courses", label: "Courses" },
          { href: "#how", label: "How cohorts work" },
          { href: "#reviews", label: "Reviews" },
          { href: "#faqs", label: "FAQs" },
        ]}
      />

      {/* Hero */}
      <section id="top" className="container-page flex flex-wrap items-center gap-12 pt-12 pb-14 sm:pt-[72px]">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
          {settings.admissions_badge && (
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-brand-soft px-3.5 py-2 text-sm font-semibold text-brand-dark">
              <span className="size-2 rounded-full bg-brand" />
              {settings.admissions_badge}
            </div>
          )}
          <h1 className="font-display text-[40px] leading-[1.04] font-bold tracking-[-0.035em] sm:text-[60px]">
            <Highlighted text={settings.hero_title ?? ""} highlight={settings.hero_highlight} />
          </h1>
          <p className="max-w-[560px] text-[17px] leading-relaxed text-body sm:text-[19px]">{settings.hero_subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <a href="#courses" className="btn-primary rounded-xl px-6 py-4 text-base">
              Explore cohorts
            </a>
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-[18px] rounded-[20px] border border-line bg-white p-5 shadow-[0_20px_40px_-24px_rgba(15,18,34,0.25)] sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Upcoming cohorts</h2>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[13px] font-semibold text-brand-dark">Seats limited</span>
          </div>
          {upcoming.length === 0 && <p className="text-sm text-muted">New cohorts will be announced soon.</p>}
          {upcoming.map((u) => (
            <Link
              key={u.id}
              href={`/courses/${u.slug}`}
              className="flex items-center gap-3.5 rounded-[14px] border border-line-soft bg-paper p-3.5 text-ink no-underline hover:border-line-strong"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-display text-base font-bold text-brand">
                {u.short_code || u.title.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="text-[15px] font-semibold">{u.short_title || u.title}</span>
                <span className="text-[13px] text-muted">
                  Starts {formatDate(u.start_date, "soon")} · {weeksLabel(u.duration_weeks)}
                </span>
              </div>
              <ArrowRight />
            </Link>
          ))}
        </div>
      </section>

      {/* Mentors */}
      {mentors.length > 0 && (
        <section id="mentors" className="container-page flex scroll-mt-20 flex-col gap-9 pt-6 pb-16 sm:pt-8 sm:pb-[88px]">
          <div className="flex flex-col gap-2.5">
            <span className="eyebrow">Mentors</span>
            <h2 className="h2">Learn from people who did it themselves.</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {mentors.map((m) => (
              <div key={m.id} className="flex flex-col gap-3 rounded-[16px] border border-line bg-white p-4">
                {m.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo_url} alt={m.name} className="h-[160px] w-full rounded-xl object-cover" style={{ objectPosition: `50% ${m.photo_position_y ?? 50}%` }} />
                ) : (
                  <div className="flex h-[160px] items-center justify-center rounded-xl bg-brand-soft font-display text-4xl font-bold text-brand-dark">
                    {initials(m.name)}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="font-display text-base font-bold">{m.name}</span>
                  <span className="text-[13px] text-muted">
                    {m.role}
                    {m.company && ` · ${m.company}`}
                  </span>
                </div>
                <span className="mt-auto self-start rounded-full border border-line bg-paper px-2.5 py-[5px] text-xs font-semibold">
                  {categoryLabel(categories, m.track)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Courses */}
      <section id="courses" className="scroll-mt-20 border-y border-line bg-white">
        <div className="container-page flex flex-col gap-8 py-16 sm:py-20">
          <div className="flex max-w-[640px] flex-col gap-2.5">
            <span className="eyebrow">Programs</span>
            <h2 className="h2">Pick a skill. Join a live cohort.</h2>
            <p className="text-[17px] leading-relaxed text-body">
              Every program runs as a live batch with a fixed start date, weekly deadlines and a mentor who reviews your work.
            </p>
          </div>
          <CourseGrid courses={courses} categories={categories} />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container-page flex scroll-mt-20 flex-col gap-10 py-16 sm:py-[88px]">
        <div className="flex max-w-[680px] flex-col gap-2.5">
          <span className="eyebrow">How a live cohort works</span>
          <h2 className="h2">Structured like a real job, paced for a student.</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]">
              <span className="font-display text-[15px] font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-[21px] font-bold">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why band */}
      <section className="bg-ink text-white">
        <div className="container-page flex flex-wrap items-center gap-12 py-16 sm:py-20">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
            <h2 className="font-display text-[32px] leading-[1.12] font-bold tracking-[-0.03em] sm:text-[40px]">
              Your buddy from admission to first job.
            </h2>
            <p className="text-[17px] leading-[1.65] text-mist">
              DUBuddy has helped lakhs of students get into college since 2020. SkillBuddy picks up from there — the skills,
              projects and network you need to get hired once you&apos;re in.
            </p>
          </div>
          <div className="grid min-w-0 flex-[1_1_420px] grid-cols-2 gap-4">
            <BandStat value="2L+" label="students practise on DUBuddy every year" />
            <BandStat value="13K+" label="DUBuddy users got into DU in 2025" />
            <BandStat value={settings.max_batch_size ? String(settings.max_batch_size) : "Small"} label="learners per batch, max" />
            <BandStat value="EMI" label="options on every program" />
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section id="reviews" className="scroll-mt-20 border-y border-line bg-white">
          <div className="container-page flex flex-col gap-9 py-16 sm:py-[88px]">
            <div className="flex max-w-[680px] flex-col gap-2.5">
              <span className="eyebrow">Learner stories</span>
              <h2 className="h2">What our learners say</h2>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5">
              {reviews.map((r) => (
                <figure key={r.id} className="flex flex-col gap-[18px] rounded-[18px] border border-line bg-paper p-[26px]">
                  <blockquote className="grow text-base leading-[1.65]">{r.quote}</blockquote>
                  <figcaption className="flex items-center gap-3">
                    {r.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo_url} alt="" className="size-11 rounded-full object-cover" />
                    ) : (
                      <div className="size-11 shrink-0 rounded-full bg-sun" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-[15px] font-semibold">{r.learner_name}</span>
                      <span className="text-[13px] text-muted">
                        {[r.college, [r.outcome_role, r.outcome_company].filter(Boolean).join(" at ")].filter(Boolean).join(" → ")}
                      </span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section id="faqs" className="mx-auto flex max-w-[860px] scroll-mt-20 flex-col gap-7 px-4 py-16 sm:px-6 sm:py-[88px]">
          <h2 className="h2 text-center">Still have questions?</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <details key={f.id} className="rounded-[14px] border border-line bg-white px-[22px]">
                <summary className="flex items-center justify-between gap-4 py-5 text-base font-semibold">
                  {f.question}
                  <Chevron />
                </summary>
                <p className="mb-5 text-[15px] leading-[1.65] text-body">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Counsellor CTA */}
      <section id="counsellor" className="container-page scroll-mt-20 pb-16 sm:pb-[88px]">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-3xl bg-brand px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
            <h2 className="font-display text-[30px] leading-[1.12] font-bold tracking-[-0.03em] sm:text-4xl">Not sure which skill to pick?</h2>
            <p className="text-[17px] leading-relaxed text-brand-tint">
              Book a free 20-minute call with a SkillBuddy counsellor. We&apos;ll map your interests and degree to a program — no
              pressure to enrol.
            </p>
          </div>
          <LeadForm />
        </div>
      </section>

      <SiteFooter courses={courses} companyName={settings.company_name} />
    </div>
  );
}

function BandStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-night p-[22px]">
      <span className="font-display text-[32px] font-bold text-sun">{value}</span>
      <span className="text-sm text-mist">{label}</span>
    </div>
  );
}

function initials(name: string) {
  const letters = name
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return letters || "SB";
}
