import type { FormState } from "@/app/actions";

export function FormMessage({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-[10px] px-3.5 py-3 text-sm font-semibold ${state.ok ? "bg-white text-leaf-ink" : "bg-white text-red-700"}`}
    >
      {state.message}
    </p>
  );
}

/** Off-screen honeypot: real people never fill it, many bots do. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
