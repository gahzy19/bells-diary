export function formatPostDate(value: string | null, compact = false) {
  if (!value) return "Not published";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: compact ? "short" : "long",
    year: "numeric",
  }).format(new Date(value));
}

export function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 210));
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
