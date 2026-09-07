export function formatEUR(value: number, opts?: { signed?: boolean; digits?: number }): string {
  const digits = opts?.digits ?? 0;
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(abs);

  if (opts?.signed) {
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `−${formatted}`;
  }
  if (value < 0) return `−${formatted}`;
  return formatted;
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits).replace(".", ",")}%`;
}

export function formatNumberIT(value: number): string {
  return new Intl.NumberFormat("it-IT").format(value);
}

export function parseRalInput(raw: string): number {
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
