import type { ReactNode } from "react";

/** Renders admin-entered text, allowing only <strong>/<b> tags. Everything else is escaped. */
export function LimitedHtml({ html }: { html: string }) {
  const escaped = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safe = escaped.replace(/&lt;(\/?)(strong|b)&gt;/gi, "<$1strong>");
  return <span dangerouslySetInnerHTML={{ __html: safe }} />;
}

/** Keeps hyphenated words like "startup-ready" from breaking across lines. */
function keepHyphenated(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\S+-\S+)/).map((part, i) =>
    i % 2 === 1 ? (
      <span key={`${keyPrefix}${i}`} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Turns `((text))` into a smaller, quieter line under the headline. */
function withSmall(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/\(\((.+?)\)\)/).flatMap((part, i) =>
    i % 2 === 1 ? (
      <span key={`${keyPrefix}${i}`} className="mt-3 block text-[0.5em] leading-tight font-semibold tracking-[-0.02em] text-muted">
        {withStrikes(part, `${keyPrefix}${i}-`)}
      </span>
    ) : (
      withStrikes(part, `${keyPrefix}${i}-`)
    ),
  );
}

/** Turns `~~word~~` into struck-through text. */
function withStrikes(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/~~(.+?)~~/).flatMap((part, i) =>
    i % 2 === 1 ? (
      <s key={`${keyPrefix}${i}`} className="text-muted decoration-brand decoration-[0.08em]">
        {part}
      </s>
    ) : (
      keepHyphenated(part, `${keyPrefix}${i}-`)
    ),
  );
}

/**
 * Wraps the first occurrence of `highlight` in the yellow marker style from the design.
 * Text between `~~` is shown struck through (e.g. "Learn ~~job~~ startup-ready skills"),
 * and text between `((` and `))` goes on a smaller line (e.g. "((not recorded videos.))").
 */
export function Highlighted({ text, highlight }: { text: string; highlight?: string | null }) {
  const i = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || i < 0) return <>{withSmall(text, "a")}</>;
  return (
    <>
      {withSmall(text.slice(0, i), "a")}
      <span className="rounded-lg bg-sun px-2 [box-decoration-break:clone]">{highlight}</span>
      {withSmall(text.slice(i + highlight.length), "b")}
    </>
  );
}
