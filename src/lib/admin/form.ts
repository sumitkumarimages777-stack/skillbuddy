import "server-only";

/** Small helpers for reading admin FormData safely. */
export const str = (fd: FormData, key: string, max = 5000) => String(fd.get(key) ?? "").trim().slice(0, max);

export const optStr = (fd: FormData, key: string, max = 2000) => {
  const v = str(fd, key, max);
  return v === "" ? null : v;
};

export const bool = (fd: FormData, key: string) => fd.get(key) === "on";

export function int(fd: FormData, key: string): number | null {
  const v = str(fd, key, 20);
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function date(fd: FormData, key: string): string | null {
  const v = str(fd, key, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

/** Parses a JSON array field produced by <ListEditor>. */
export function jsonList<T>(fd: FormData, key: string): T[] {
  try {
    const v = JSON.parse(String(fd.get(key) ?? "[]"));
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

export const isUuid = (v: string | null | undefined): v is string => !!v && /^[0-9a-f-]{36}$/i.test(v);

export function errorMessage(error: { message: string; code?: string } | null, fallback = "Something went wrong.") {
  if (!error) return fallback;
  if (error.code === "23505") return "That value is already used (it must be unique).";
  if (error.code === "42501") return "You don't have permission to do that.";
  return error.message || fallback;
}
