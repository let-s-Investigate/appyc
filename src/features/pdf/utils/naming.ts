/** "Merged" -> "Merged_2026-07-06" (display title, .pdf added at file level) */
export function buildOutputTitle(prefix: string): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${prefix}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Safe unique on-disk filename for a display title */
export function buildOutputFilename(title: string): string {
  const sanitized = title.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${sanitized}_${Date.now()}.pdf`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
