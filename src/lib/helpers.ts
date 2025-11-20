import { Record } from "../interfaces";

export function toCsv(records: Record[]): string {
  if (!records || records.length === 0) return "";
  const keys = Object.keys(records[0]).filter(
    (k) => !["id", "createdAt", "updatedAt"].includes(k)
  );
  const lines = [keys.join(",")];
  for (const r of records) {
    const row = keys
      .map((k) => `"${((r as any)[k] ?? "").toString().replace(/"/g, '""')}"`)
      .join(",");
    lines.push(row);
  }
  return lines.join("\n");
}

export function download(
  filename: string,
  content: string | Blob,
  mime = "text/csv"
) {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type: mime + ";charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
