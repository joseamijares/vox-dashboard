// Currency formatter — always 2 decimal places, comma separators
export function fmtCurrency(value: number | string | null | undefined): string {
  const num = typeof value === "number" ? value : parseFloat(value as string);
  if (isNaN(num)) return "$0.00";
  return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Compact currency — for small spaces, drops cents on large numbers
export function fmtCurrencyCompact(value: number | string | null | undefined): string {
  const num = typeof value === "number" ? value : parseFloat(value as string);
  if (isNaN(num)) return "$0";
  if (num >= 1_000_000) {
    return "$" + (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return "$" + (num / 1_000).toFixed(1) + "K";
  }
  return "$" + num.toFixed(2);
}

// Number with commas, no decimals (for counts)
export function fmtNumber(value: number | string | null | undefined): string {
  const num = typeof value === "number" ? value : parseFloat(value as string);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US");
}

// Percentage — always 1 decimal place
export function fmtPct(value: number | string | null | undefined): string {
  const num = typeof value === "number" ? value : parseFloat(value as string);
  if (isNaN(num)) return "0.0%";
  return num.toFixed(1) + "%";
}

// Grade display — integer
export function fmtGrade(value: number | string | null | undefined): string {
  const num = typeof value === "number" ? value : parseFloat(value as string);
  if (isNaN(num)) return "—";
  return Math.round(num).toString();
}
