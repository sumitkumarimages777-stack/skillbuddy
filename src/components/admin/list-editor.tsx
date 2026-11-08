"use client";

import { useState } from "react";
import { controlClass } from "./fields";

type FieldSpec = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  wide?: boolean;
};

type Row = Record<string, string>;

/**
 * Editable, reorderable list of rows (modules, batches, projects…).
 * Serialises to a hidden JSON input called `name`, read on the server with jsonList().
 * Rows keep their `id` so existing records are updated rather than recreated.
 */
export function ListEditor({
  name,
  fields,
  initial,
  addLabel = "Add row",
  emptyText = "Nothing here yet.",
}: {
  name: string;
  fields: FieldSpec[];
  initial: Row[];
  addLabel?: string;
  emptyText?: string;
}) {
  const [rows, setRows] = useState<(Row & { _key: string })[]>(() =>
    initial.map((r, i) => ({ ...r, _key: r.id ?? `init-${i}` })),
  );

  const blank = () =>
    Object.fromEntries(fields.map((f) => [f.key, f.type === "select" ? (f.options?.[0]?.value ?? "") : ""])) as Row;

  const update = (i: number, key: string, value: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const move = (i: number, d: -1 | 1) =>
    setRows((rs) => {
      const next = [...rs];
      const j = i + d;
      if (j < 0 || j >= next.length) return rs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const remove = (i: number) => setRows((rs) => rs.filter((_, j) => j !== i));
  const add = () => setRows((rs) => [...rs, { ...blank(), _key: crypto.randomUUID() }]);

  const serialised = JSON.stringify(
    rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => k !== "_key"))),
  );

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={serialised} />
      {rows.length === 0 && <p className="text-sm text-muted">{emptyText}</p>}
      {rows.map((row, i) => (
        <div key={row._key} className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold tracking-wide text-muted uppercase">#{i + 1}</span>
            <div className="flex gap-1">
              <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </IconButton>
              <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                ↓
              </IconButton>
              <IconButton label="Remove" onClick={() => remove(i)} danger>
                ✕
              </IconButton>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className={`flex flex-col gap-1 text-xs font-semibold text-muted ${f.wide || f.type === "textarea" ? "sm:col-span-2" : ""}`}>
                {f.label}
                {f.type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={row[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={controlClass}
                  />
                ) : f.type === "select" ? (
                  <select value={row[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)} className={controlClass}>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={row[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={controlClass}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn-outline self-start">
        + {addLabel}
      </button>
    </div>
  );
}

/** Simple list of strings (e.g. learning outcomes). */
export function StringListEditor({ name, initial, addLabel = "Add item", placeholder }: { name: string; initial: string[]; addLabel?: string; placeholder?: string }) {
  const [items, setItems] = useState(() => initial.map((v, i) => ({ v, k: `init-${i}` })));
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(items.map((x) => x.v.trim()).filter(Boolean))} />
      {items.map((item, i) => (
        <div key={item.k} className="flex gap-2">
          <input
            value={item.v}
            placeholder={placeholder}
            onChange={(e) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))}
            className={controlClass}
          />
          <IconButton label="Remove" onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))} danger>
            ✕
          </IconButton>
        </div>
      ))}
      <button type="button" onClick={() => setItems((xs) => [...xs, { v: "", k: crypto.randomUUID() }])} className="btn-outline self-start">
        + {addLabel}
      </button>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex size-11 shrink-0 items-center justify-center rounded-lg border bg-white text-sm disabled:opacity-30 sm:size-9 ${
        danger ? "border-red-200 text-red-700 hover:bg-red-50" : "border-line-strong text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
