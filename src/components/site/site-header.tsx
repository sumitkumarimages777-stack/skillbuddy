import Link from "next/link";
import { Logo } from "./icons";

type NavLink = { href: string; label: string };

export function SiteHeader({
  links,
  homeHref = "/",
  cta,
  showLogin = false,
}: {
  links: NavLink[];
  homeHref?: string;
  cta: NavLink;
  showLogin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <nav className="container-page flex flex-wrap items-center justify-between gap-4 py-3.5">
        <Link href={homeHref} className="text-ink no-underline" aria-label="SkillBuddy home">
          <Logo />
        </Link>
        <div className="hidden flex-wrap items-center gap-x-6 gap-y-1 text-[15px] font-medium md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="py-2.5 text-ink no-underline hover:text-brand">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          {showLogin && (
            <Link href="/admin/login" className="btn-outline hidden px-4 sm:inline-flex">
              Log in
            </Link>
          )}
          <a href={cta.href} className="btn-primary">
            {cta.label}
          </a>
        </div>
      </nav>
    </header>
  );
}
