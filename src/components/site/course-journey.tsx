"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatDate, weeksLabel } from "@/lib/format";
import type { CategoryItem, Course } from "@/lib/types";

type RingId = "product" | "engineering" | "operations" | "marketing" | "support";
type NodeId = RingId | "business" | "creative";

/** The product loop, in the order the ball travels. Ids match the `categories` table. */
const RING: { id: RingId; label: string; step: string; caption: string; blurb: string }[] = [
  {
    id: "product",
    label: "Product",
    step: "Idea → prototype",
    caption: "Product turns a customer problem into a spec and a clickable prototype.",
    blurb: "Decide what to build and why: talk to users, write the spec, prototype it, define success.",
  },
  {
    id: "engineering",
    label: "Engineering",
    step: "Build it",
    caption: "The prototype is thrown to Engineering, who build it and ship it.",
    blurb: "Turn the spec into working software and ship it to users.",
  },
  {
    id: "operations",
    label: "Operations",
    step: "Run it",
    caption: "Operations keeps it running: processes, data, finance and the founder's office.",
    blurb: "Keep the business running day to day: processes, data, finance and the founder's office.",
  },
  {
    id: "marketing",
    label: "Marketing",
    step: "Tell people",
    caption: "Marketing gets it in front of users and grows it.",
    blurb: "Get the product in front of users, tell its story and grow it.",
  },
  {
    id: "support",
    label: "Customer Support",
    step: "Fix what breaks",
    caption: "When users hit a problem, Customer Support catches it and throws the feedback back to Product.",
    blurb: "Catch user problems, solve them fast, and feed what you learn back to Product.",
  },
];

const EXTRA: Record<"business" | "creative", { label: string; blurb: string }> = {
  business: {
    label: "Business",
    blurb: "Every team in the loop exists to serve the business: a customer problem worth solving, and a company that makes money solving it.",
  },
  creative: {
    label: "Creative",
    blurb: "The craft layer that feeds the loop: UI/UX for Product, and editing, banners, posters and design for Marketing.",
  },
};

const CREATIVE_LINKS: { to: "product" | "marketing"; label: string }[] = [
  { to: "product", label: "UI/UX" },
  { to: "marketing", label: "Editing · Banners · Posters · Design" },
];

/** Ring angles in degrees (0 = right, clockwise), one per RING entry. */
const ANGLES = [-110, -38, 34, 106, 178];
const HOLD_MS = 1300;
const MOVE_MS = 1300;
const STEP_MS = HOLD_MS + MOVE_MS;

type Layout = {
  w: number;
  h: number;
  cx: number;
  cy: number;
  R: number;
  nodeR: number;
  hubR: number;
  font: number;
  creative: [number, number];
  /** Quadratic-curve control point for Creative → Product / Marketing, and where each label sits. */
  curves: Record<"product" | "marketing", { c: [number, number]; label: [number, number]; anchor: "start" | "middle" | "end"; text: string }>;
};

const DESKTOP: Layout = {
  w: 900,
  h: 660,
  cx: 590,
  cy: 330,
  R: 232,
  nodeR: 70,
  hubR: 78,
  font: 22,
  creative: [108, 330],
  curves: {
    product: { c: [170, 110], label: [228, 172], anchor: "middle", text: "UI/UX" },
    marketing: { c: [170, 560], label: [262, 506], anchor: "middle", text: "Editing · Banners · Posters · Design" },
  },
};

const MOBILE: Layout = {
  w: 360,
  h: 500,
  cx: 210,
  cy: 222,
  R: 116,
  nodeR: 40,
  hubR: 44,
  font: 12,
  creative: [66, 438],
  curves: {
    product: { c: [-34, 226], label: [36, 330], anchor: "middle", text: "UI/UX" },
    marketing: { c: [130, 420], label: [116, 410], anchor: "start", text: "Editing · Posters" },
  },
};

const polar = (l: Layout, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [l.cx + l.R * Math.cos(a), l.cy + l.R * Math.sin(a)];
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

type Ball = { step: number; deg: number; moving: boolean; t: number };

/** Ball angle and current step for elapsed time `ms`. */
function ballAt(ms: number): Ball {
  const n = RING.length;
  const step = Math.floor(ms / STEP_MS) % n;
  const within = ms % STEP_MS;
  const moving = within >= HOLD_MS;
  const t = moving ? ease((within - HOLD_MS) / MOVE_MS) : 0;
  const from = ANGLES[step];
  let to = ANGLES[(step + 1) % n];
  if (to < from) to += 360;
  return { step, deg: from + (to - from) * t, moving, t };
}

function JourneyMap({
  layout: l,
  selected,
  onSelect,
  subs,
  labels,
  ball,
  className,
}: {
  layout: Layout;
  selected: NodeId;
  onSelect: (id: NodeId) => void;
  subs: Record<NodeId, string>;
  labels: Record<NodeId, string>;
  ball: Ball;
  className: string;
}) {
  const ringPos = Object.fromEntries(RING.map((n, i) => [n.id, polar(l, ANGLES[i])])) as Record<RingId, [number, number]>;

  // The ball rests just inside each team's circle (so it never covers the text)
  // and is thrown in an arc out along the ring to the next team.
  const ballR = l.nodeR * 0.2;
  const rest = l.R - l.nodeR - ballR - 6;
  const lift = ball.moving ? Math.sin(ball.t * Math.PI) * (l.R - rest) : 0;
  const a = (ball.deg * Math.PI) / 180;
  const ballX = l.cx + (rest + lift) * Math.cos(a);
  const ballY = l.cy + (rest + lift) * Math.sin(a);
  const shadowX = l.cx + rest * Math.cos(a);
  const shadowY = l.cy + rest * Math.sin(a);

  const node = (id: NodeId, cx: number, cy: number, r: number, opts: { dark?: boolean; dashed?: boolean; glow?: boolean } = {}) => {
    const isSel = selected === id;
    const inverted = isSel || !!opts.dark;
    return (
      <g
        key={id}
        role="button"
        tabIndex={0}
        aria-pressed={isSel}
        aria-label={`${labels[id]}: ${subs[id]}`}
        onClick={() => onSelect(id)}
        onKeyDown={(ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            onSelect(id);
          }
        }}
        className="group cursor-pointer outline-none"
      >
        {(isSel || opts.glow) && <circle cx={cx} cy={cy} r={r + 9} className={isSel ? "fill-brand-soft" : "fill-sun-soft"} />}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          strokeWidth={isSel || opts.dark ? 0 : 1.5}
          strokeDasharray={opts.dashed && !isSel ? "5 5" : undefined}
          className={`transition-colors duration-200 group-focus-visible:stroke-brand ${
            isSel ? "fill-brand" : opts.dark ? "fill-ink" : "fill-white stroke-line-strong group-hover:stroke-brand"
          }`}
        />
        <text
          x={cx}
          y={cy - l.font * 0.35}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={l.font}
          className={`pointer-events-none font-display font-bold ${inverted ? "fill-white" : "fill-ink"}`}
        >
          {labels[id]}
        </text>
        <text
          x={cx}
          y={cy + l.font * 0.75}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.round(l.font * 0.72)}
          className={`pointer-events-none font-sans ${inverted ? "fill-white/80" : "fill-muted"}`}
        >
          {subs[id]}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${l.w} ${l.h}`} className={className} role="group" aria-label="Product journey: Product, Engineering, Operations, Marketing, Customer Support, and back to Product">
      {/* Spokes from Business to every team */}
      {RING.map((n) => (
        <line key={`spoke-${n.id}`} x1={l.cx} y1={l.cy} x2={ringPos[n.id][0]} y2={ringPos[n.id][1]} strokeWidth={1.2} className="stroke-line" />
      ))}

      {/* Ring segments with a direction chevron at each midpoint */}
      {RING.map((n, i) => {
        const next = RING[(i + 1) % RING.length].id;
        const a0 = ANGLES[i];
        let a1 = ANGLES[(i + 1) % RING.length];
        if (a1 < a0) a1 += 360;
        const [x0, y0] = polar(l, a0);
        const [x1, y1] = polar(l, a1);
        const mid = (a0 + a1) / 2;
        const [mx, my] = polar(l, mid);
        const flying = ball.moving && ball.step === i;
        const near = selected === n.id || selected === next;
        return (
          <g key={`seg-${n.id}`}>
            <path
              d={`M ${x0} ${y0} A ${l.R} ${l.R} 0 0 1 ${x1} ${y1}`}
              fill="none"
              strokeWidth={flying ? 3.5 : 2}
              className={`transition-[stroke] duration-300 ${flying ? "stroke-sun" : near ? "stroke-brand" : "stroke-line-strong"}`}
            />
            <path
              d="M -6 -7 L 4 0 L -6 7"
              fill="none"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={`translate(${mx} ${my}) rotate(${mid + 90})`}
              className={near ? "stroke-brand" : "stroke-muted"}
            />
          </g>
        );
      })}

      {/* Creative feeds Product (UI/UX) and Marketing (editing, posters…) */}
      {CREATIVE_LINKS.map((link) => {
        const cfg = l.curves[link.to];
        const [x0, y0] = l.creative;
        const [x1, y1] = ringPos[link.to];
        const on = selected === "creative" || selected === link.to;
        const fs = l.font - 6 < 10 ? 10 : l.font - 6;
        const textW = cfg.text.length * fs * 0.52;
        const padX = Math.round(fs * 0.7);
        const [lx, ly] = cfg.label;
        const rectX = cfg.anchor === "middle" ? lx - textW / 2 - padX : cfg.anchor === "end" ? lx - textW - padX * 2 : lx;
        return (
          <g key={`creative-${link.to}`}>
            <path
              d={`M ${x0} ${y0} Q ${cfg.c[0]} ${cfg.c[1]} ${x1} ${y1}`}
              fill="none"
              strokeWidth={on ? 2.2 : 1.5}
              strokeDasharray="6 7"
              strokeLinecap="round"
              className={on ? "stroke-brand motion-safe:animate-[journey-dash_0.9s_linear_infinite]" : "stroke-line-strong"}
            />
            <g aria-hidden="true">
              <rect
                x={rectX}
                y={ly - fs * 0.95}
                width={textW + padX * 2}
                height={fs * 1.9}
                rx={fs * 0.95}
                strokeWidth={1}
                className={on ? "fill-brand-soft stroke-brand" : "fill-white stroke-line"}
              />
              <text
                x={rectX + padX + textW / 2}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fs}
                className={`font-sans font-semibold ${on ? "fill-brand-dark" : "fill-muted"}`}
              >
                {cfg.text}
              </text>
            </g>
          </g>
        );
      })}

      {/* The ball (drawn under the circles, so each team "catches" it) */}
      <g aria-hidden="true" className="pointer-events-none">
        <ellipse cx={shadowX} cy={shadowY + ballR * 0.9} rx={ballR * (1 - (lift / (l.R - rest)) * 0.5)} ry={ballR * 0.32} className="fill-ink/15" />
        <circle cx={ballX} cy={ballY} r={ballR} strokeWidth={2} className="fill-sun stroke-ink" />
        <circle cx={ballX - ballR * 0.3} cy={ballY - ballR * 0.3} r={ballR * 0.3} className="fill-white/70" />
      </g>
      {node("business", l.cx, l.cy, l.hubR, { dark: true })}
      {node("creative", l.creative[0], l.creative[1], l.nodeR, { dashed: true })}
      {RING.map((n, i) => node(n.id, ringPos[n.id][0], ringPos[n.id][1], l.nodeR, { glow: !ball.moving && ball.step === i }))}

    </svg>
  );
}

export function CourseJourney({ courses, categories }: { courses: Course[]; categories: CategoryItem[] }) {
  const [selected, setSelected] = useState<NodeId>("product");
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  // Respect reduced motion: start paused (steps can still be clicked).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    startRef.current = null;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now - elapsedRef.current;
      elapsedRef.current = now - startRef.current;
      setElapsed(elapsedRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const jumpTo = (i: number) => {
    elapsedRef.current = i * STEP_MS;
    startRef.current = null;
    setElapsed(elapsedRef.current);
  };

  const ball = ballAt(elapsed);
  const allIds: NodeId[] = [...RING.map((n) => n.id), "business", "creative"];
  const byNode = Object.fromEntries(allIds.map((id) => [id, courses.filter((c) => c.category === id)])) as Record<NodeId, Course[]>;
  const fallback = (id: NodeId) => (id === "business" || id === "creative" ? EXTRA[id].label : RING.find((n) => n.id === id)!.label);
  const labels = Object.fromEntries(allIds.map((id) => [id, categories.find((c) => c.id === id)?.label ?? fallback(id)])) as Record<NodeId, string>;
  const subs = Object.fromEntries(
    allIds.map((id) => {
      const n = byNode[id].length;
      return [id, id === "business" ? "The core" : n > 0 ? `${n} program${n > 1 ? "s" : ""}` : "Coming soon"];
    }),
  ) as Record<NodeId, string>;
  // "Customer Support" doesn't fit in a circle; the panel shows the full name.
  const circleLabels = { ...labels, support: "Support" };
  const mapped = new Set<string>(allIds);
  const others = courses.filter((c) => !mapped.has(c.category));

  const ringNode = RING.find((n) => n.id === selected);
  const blurb = ringNode ? ringNode.blurb : EXTRA[selected as "business" | "creative"].blurb;
  const nodeCourses = byNode[selected];
  const current = RING[ball.step];

  const select = (id: NodeId) => {
    setSelected(id);
    const i = RING.findIndex((n) => n.id === id);
    if (i >= 0) jumpTo(i);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-paper p-3 sm:p-6">
          {/* Caption that follows the ball */}
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3.5 sm:p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sun font-display text-sm font-bold text-ink">
              {ball.step + 1}
            </span>
            <div className="flex min-h-[3.25rem] min-w-0 grow flex-col gap-0.5">
              <span className="font-display text-[17px] font-bold">
                {labels[current.id]} · {current.step}
              </span>
              <span className="text-sm leading-snug text-body">{current.caption}</span>
            </div>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause animation" : "Play animation"}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-white text-ink hover:border-ink"
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
                  <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>

          <JourneyMap layout={DESKTOP} selected={selected} onSelect={select} subs={subs} labels={circleLabels} ball={ball} className="hidden h-auto w-full sm:block" />
          <JourneyMap layout={MOBILE} selected={selected} onSelect={select} subs={subs} labels={circleLabels} ball={ball} className="block h-auto w-full sm:hidden" />

          {/* Steps */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {RING.map((n, i) => (
              <button
                key={n.id}
                type="button"
                onClick={() => select(n.id)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  ball.step === i ? "bg-ink text-white" : "bg-white text-muted hover:text-ink"
                }`}
              >
                {i + 1}. {n.step}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite" className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6 lg:sticky lg:top-24">
          <span className="eyebrow">{selected === "business" ? "The core" : selected === "creative" ? "Feeds the loop" : "Vertical"}</span>
          <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">{labels[selected]}</h3>
          <p className="text-[15px] leading-relaxed text-body">{blurb}</p>

          {selected === "business" && (
            <div className="flex flex-wrap gap-2">
              {RING.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => select(n.id)}
                  className="cursor-pointer rounded-full border border-line-strong bg-white px-3.5 py-1.5 text-sm font-medium text-ink hover:border-ink"
                >
                  {labels[n.id]}
                </button>
              ))}
            </div>
          )}

          {selected === "creative" && (
            <ul className="flex flex-col gap-2">
              {CREATIVE_LINKS.map((link) => (
                <li key={link.to}>
                  <button
                    type="button"
                    onClick={() => select(link.to)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-left text-sm hover:border-brand"
                  >
                    <span className="font-semibold text-ink">{link.label}</span>
                    <span className="shrink-0 text-muted">→ {labels[link.to]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selected !== "business" &&
            (nodeCourses.length === 0 ? (
              <span className="self-start rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-muted">Programs coming soon</span>
            ) : (
              <ul className="flex flex-col gap-2">
                {nodeCourses.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/courses/${c.slug}`}
                      className="flex flex-col gap-0.5 rounded-xl border border-line bg-paper p-3.5 no-underline transition-colors hover:border-brand"
                    >
                      <span className="text-[15px] leading-snug font-semibold text-ink">{c.title}</span>
                      <span className="text-xs text-muted">
                        {weeksLabel(c.duration_weeks)} · Starts {formatDate(c.start_date, "soon")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </div>

      {others.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-muted">More programs</span>
          <div className="flex flex-wrap gap-2">
            {others.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                className="rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-medium text-ink no-underline hover:border-ink"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
