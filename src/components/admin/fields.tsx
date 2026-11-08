import type { ComponentProps, ReactNode } from "react";

const control =
  "w-full rounded-lg border border-line-strong bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold text-ink ${className}`}>
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function TextInput({ label, hint, className, ...props }: ComponentProps<"input"> & { label: string; hint?: ReactNode }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input {...props} className={control} />
    </Field>
  );
}

export function TextArea({ label, hint, className, ...props }: ComponentProps<"textarea"> & { label: string; hint?: ReactNode }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <textarea rows={3} {...props} className={`${control} resize-y`} />
    </Field>
  );
}

export function Select({
  label,
  hint,
  options,
  className,
  ...props
}: ComponentProps<"select"> & { label: string; hint?: ReactNode; options: { value: string; label: string }[] }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select {...props} className={control}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Checkbox({ label, hint, ...props }: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5 text-sm font-semibold text-ink">
      <input type="checkbox" value="on" {...props} className="mt-0.5 size-4 accent-brand" />
      <span className="flex flex-col gap-0.5">
        {label}
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function Card({ title, description, children, actions }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export const controlClass = control;
