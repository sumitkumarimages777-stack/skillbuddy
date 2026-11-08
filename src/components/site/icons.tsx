export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="9" fill="#2D3FE0" />
        <path
          d="M10 21.5c1.6 1.6 3.9 2.5 6.6 2.5 3.4 0 5.4-1.6 5.4-3.9 0-5-11-2.6-11-8 0-2.3 2-4.1 5.4-4.1 2.3 0 4.1.7 5.4 1.9"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="25" cy="9" r="3" fill="#FFCF3D" />
      </svg>
      <span className="font-display text-[22px] font-bold tracking-[-0.02em]">SkillBuddy</span>
    </span>
  );
}

export function Chevron({ className = "chev transition-transform" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555A6B" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Check() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D3FE0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px shrink-0">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
