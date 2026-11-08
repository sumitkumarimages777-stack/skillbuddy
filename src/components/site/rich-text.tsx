/** Renders admin-entered text, allowing only <strong>/<b> tags. Everything else is escaped. */
export function LimitedHtml({ html }: { html: string }) {
  const escaped = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safe = escaped.replace(/&lt;(\/?)(strong|b)&gt;/gi, "<$1strong>");
  return <span dangerouslySetInnerHTML={{ __html: safe }} />;
}

/** Wraps the first occurrence of `highlight` in the yellow marker style from the design. */
export function Highlighted({ text, highlight }: { text: string; highlight?: string | null }) {
  const i = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="rounded-lg bg-sun px-2 [box-decoration-break:clone]">{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  );
}
