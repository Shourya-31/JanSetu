export const percentage = (count: number, total: number) =>
  total > 0 ? Math.round((count / total) * 10000) / 100 : 0;
export function numericValue(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
export function displayAnswer(value: unknown): string {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && !value.trim()) ||
    (Array.isArray(value) && !value.length)
  )
    return "Not answered";
  if (Array.isArray(value)) return value.map(displayAnswer).join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
