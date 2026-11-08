const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatPrice(value: number | null | undefined, fallback = "To be announced") {
  return value == null ? fallback : inr.format(value);
}

export function formatDate(value: string | null | undefined, fallback = "To be announced") {
  if (!value) return fallback;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function weeksLabel(weeks: number | null | undefined) {
  return weeks ? `${weeks} weeks` : "Duration TBA";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
