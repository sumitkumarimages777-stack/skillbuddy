"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate, weeksLabel } from "@/lib/format";
import type { CategoryItem, Course } from "@/lib/types";

type NodeId = "business" | "product" | "engineering" | "operations" | "marketing" | "creative";

/** Verticals in the map. Ids (except "business") match the `categories` table. */
const NODES: { id: NodeId; label: string; blurb: string }[] = [
  { id: "business", label: "Business", blurb: "Every startup starts with a customer problem worth solving. The four teams below exist to serve it." },
  { id: "product", label: "Product", blurb: "Decide what to build and why: talk to users, write the spec, define success." },
  { id: "engineering", label: "Engineering", blurb: "Turn the spec into working software and ship it." },
  { id: "operations", label: "Operations", blurb: "Keep the business running: processes, data, finance and the founder's office." },
  { id: "marketing", label: "Marketing", blurb: "Get the product in front of users and grow it." },
  { id: "creative", label: "Creative", blurb: "The craft layer that feeds the other teams." },
];

/** Where Creative's skills flow. */
const CREATIVE_LINKS: { to: NodeId; label: string; short: string }[] = [
  { to: "product", label: "UI/UX", short: "UI/UX" },
  { to: "marketing", label: "Editing · Banners · Posters · Design", short: "Editing · Posters" },
];

const MIDDLE: NodeId[] = ["product", "engineering", "operations", "marketing"];

type Layout = {
  w: number;
  h: number;
  pos: Record<NodeId, [number, number]>;
  r: Record<"hub" | "mid", number>;
  font: number;
  short: boolean;
  /** How far along the Creative edge (0 = Creative) the label sits, and how it's anchored. */
  labelT: number;
  labelAnchor: (to: NodeId) => "start" | "middle" | "end";
};

const DESKTOP: Layout = {
  w: 1000,
  h: 640,
  pos: {
    business: [500, 92],
    product: [140, 320],
    engineering: [380, 320],
    operations: [620, 320],
    marketing: [860, 320],
    creative: [500, 548],
  },
  r: { hub: 74, mid: 72 },
  font: 22,
  short: false,
  labelT: 0.5,
  labelAnchor: () => "middle",
};

const MOBILE: Layout = {
  w: 360,
  h: 500,
  pos: {
    business: [180, 56],
    product: [46, 245],
    engineering: [136, 245],
    operations: [224, 245],
    marketing: [314, 245],
    creative: [180, 440],
  },
  r: { hub: 48, mid: 42 },
  font: 13,
  short: true,
  labelT: 0.38,
  labelAnchor: (to) => (to === "product" ? "end" : "start"),
};

function edgeKey(a: NodeId, b: NodeId) {
  return `${a}-${b}`;
}

function JourneyMap({
  layout,
  selected,
  onSelect,
  counts,
  labels,
  className,
}: {
  layout: Layout;
  selected: NodeId;
  onSelect: (id: NodeId) => void;
  counts: Record<NodeId, number>;
  labels: Record<NodeId, string>;
  className: string;
}) {
  const { pos, r } = layout;
  const edges: { from: NodeId; to: NodeId; label?: string }[] = [
    ...MIDDLE.map((m) => ({ from: "business" as NodeId, to: m })),
    ...CREATIVE_LINKS.map((l) => ({ from: "creative" as NodeId, to: l.to, label: layout.short ? l.short : l.label })),
  ];
  const active = (e: { from: NodeId; to: NodeId }) => e.from === selected || e.to === selected;

  return (
    <svg viewBox={`0 0 ${layout.w} ${layout.h}`} className={className} role="group" aria-label="Career journey map">
      {/* Edges */}
      {edges.map((e) => {
        const [x1, y1] = pos[e.from];
        const [x2, y2] = pos[e.to];
        const on = active(e);
        return (
          <line
            key={edgeKey(e.from, e.to)}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeWidth={on ? 2.5 : 1.5}
            strokeLinecap="round"
            strokeDasharray={e.label ? "6 7" : undefined}
            className={`transition-[stroke] duration-200 ${on ? "stroke-brand" : "stroke-line-strong"} ${on && e.label ? "motion-safe:animate-[journey-dash_0.9s_linear_infinite]" : ""}`}
          />
        );
      })}

      {/* Creative edge labels */}
      {edges
        .filter((e) => e.label)
        .map((e) => {
          const [x1, y1] = pos[e.from];
          const [x2, y2] = pos[e.to];
          const t = layout.labelT;
          const x = x1 + (x2 - x1) * t;
          const y = y1 + (y2 - y1) * t;
          const fs = layout.font - 3;
          const textW = (e.label?.length ?? 0) * fs * 0.52;
          const padX = 9;
          const anchor = layout.labelAnchor(e.to);
          const gap = anchor === "middle" ? 0 : 6;
          const rectX = anchor === "middle" ? x - textW / 2 - padX : anchor === "end" ? x - gap - textW - padX * 2 : x + gap;
          const on = active(e);
          return (
            <g key={`label-${e.to}`} aria-hidden="true">
              <rect
                x={rectX}
                y={y - fs * 0.95}
                width={textW + padX * 2}
                height={fs * 1.9}
                rx={fs * 0.95}
                className={`transition-colors duration-200 ${on ? "fill-brand-soft stroke-brand" : "fill-white stroke-line"}`}
                strokeWidth={1}
              />
              <text
                x={rectX + padX + textW / 2}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fs}
                className={`font-sans font-semibold ${on ? "fill-brand-dark" : "fill-muted"}`}
              >
                {e.label}
              </text>
            </g>
          );
        })}

      {/* Nodes */}
      {NODES.map((n) => {
        const [cx, cy] = pos[n.id];
        const isHub = n.id === "business" || n.id === "creative";
        const radius = isHub ? r.hub : r.mid;
        const isSel = n.id === selected;
        const count = counts[n.id];
        const sub = n.id === "business" ? "Start here" : count > 0 ? `${count} program${count > 1 ? "s" : ""}` : "Coming soon";
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSel}
            aria-label={`${labels[n.id]}: ${sub}`}
            onClick={() => onSelect(n.id)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                onSelect(n.id);
              }
            }}
            className="group cursor-pointer outline-none"
          >
            {isSel && <circle cx={cx} cy={cy} r={radius + 9} className="fill-brand-soft" />}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              strokeWidth={isSel ? 0 : 1.5}
              className={`transition-colors duration-200 group-focus-visible:stroke-brand ${
                isSel ? "fill-brand" : n.id === "business" ? "fill-ink stroke-ink" : "fill-white stroke-line-strong group-hover:stroke-brand"
              }`}
            />
            <text
              x={cx}
              y={cy - layout.font * 0.35}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={layout.font}
              className={`pointer-events-none font-display font-bold ${isSel || n.id === "business" ? "fill-white" : "fill-ink"}`}
            >
              {labels[n.id]}
            </text>
            <text
              x={cx}
              y={cy + layout.font * 0.75}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.round(layout.font * 0.72)}
              className={`pointer-events-none font-sans ${isSel || n.id === "business" ? "fill-white/80" : "fill-muted"}`}
            >
              {sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CourseJourney({ courses, categories }: { courses: Course[]; categories: CategoryItem[] }) {
  const [selected, setSelected] = useState<NodeId>("product");

  const byNode = Object.fromEntries(NODES.map((n) => [n.id, courses.filter((c) => c.category === n.id)])) as Record<NodeId, Course[]>;
  const counts = Object.fromEntries(NODES.map((n) => [n.id, byNode[n.id].length])) as Record<NodeId, number>;
  const labels = Object.fromEntries(NODES.map((n) => [n.id, categories.find((c) => c.id === n.id)?.label ?? n.label])) as Record<NodeId, string>;
  const mapped = new Set<string>(NODES.map((n) => n.id));
  const others = courses.filter((c) => !mapped.has(c.category));

  const node = NODES.find((n) => n.id === selected)!;
  const nodeCourses = byNode[selected];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[20px] border border-line bg-paper p-3 sm:p-6">
          <JourneyMap layout={DESKTOP} selected={selected} onSelect={setSelected} counts={counts} labels={labels} className="hidden h-auto w-full sm:block" />
          <JourneyMap layout={MOBILE} selected={selected} onSelect={setSelected} counts={counts} labels={labels} className="block h-auto w-full sm:hidden" />
          <p className="mt-2 text-center text-[13px] text-muted">Tap a circle to see its programs.</p>
        </div>

        <div aria-live="polite" className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6 lg:sticky lg:top-24">
          <span className="eyebrow">{selected === "business" ? "The core" : "Vertical"}</span>
          <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">{labels[selected]}</h3>
          <p className="text-[15px] leading-relaxed text-body">{node.blurb}</p>

          {selected === "business" && (
            <div className="flex flex-wrap gap-2">
              {MIDDLE.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelected(m)}
                  className="cursor-pointer rounded-full border border-line-strong bg-white px-3.5 py-1.5 text-sm font-medium text-ink hover:border-ink"
                >
                  {labels[m]}
                </button>
              ))}
            </div>
          )}

          {selected === "creative" && (
            <ul className="flex flex-col gap-2">
              {CREATIVE_LINKS.map((l) => (
                <li key={l.to}>
                  <button
                    type="button"
                    onClick={() => setSelected(l.to)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5 text-left text-sm hover:border-brand"
                  >
                    <span className="font-semibold text-ink">{l.label}</span>
                    <span className="shrink-0 text-muted">→ {labels[l.to]}</span>
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
