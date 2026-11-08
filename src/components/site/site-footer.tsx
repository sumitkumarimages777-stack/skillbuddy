import Link from "next/link";
import type { Course } from "@/lib/types";

export function SiteFooter({ courses, companyName }: { courses: Course[]; companyName: string | null }) {
  const company = companyName || "Cyberflow Tech Private Limited";
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page flex flex-wrap justify-between gap-10 py-12">
        <div className="flex flex-[1_1_260px] flex-col gap-3">
          <span className="font-display text-[22px] font-bold">SkillBuddy</span>
          <p className="max-w-[300px] text-sm leading-relaxed text-muted">
            Live cohort-based skill programs for college students and freshers. A sister product of DUBuddy.
          </p>
        </div>
        <FooterCol title="Programs">
          {courses.slice(0, 6).map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`} className="text-body no-underline hover:text-brand">
              {c.short_title || c.title}
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="Company">
          <Link href="/#how" className="text-body no-underline hover:text-brand">About</Link>
          <Link href="/#counsellor" className="text-body no-underline hover:text-brand">Hire from us</Link>
          <a href="https://dubuddy.in/" className="text-body no-underline hover:text-brand">DUBuddy</a>
        </FooterCol>
        <FooterCol title="Legal">
          <a href="#privacy" className="text-body no-underline hover:text-brand">Privacy policy</a>
          <a href="#terms" className="text-body no-underline hover:text-brand">Terms of use</a>
          <a href="#refund" className="text-body no-underline hover:text-brand">Refund policy</a>
          <Link href="/#counsellor" className="text-body no-underline hover:text-brand">Contact us</Link>
        </FooterCol>
      </div>
      <div className="border-t border-line px-6 py-[18px] text-center text-[13px] text-muted">
        © {new Date().getFullYear()} {company}. SkillBuddy and DUBuddy are products of Cyberflow Tech.
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 text-sm">
      <span className="font-bold">{title}</span>
      {children}
    </div>
  );
}
