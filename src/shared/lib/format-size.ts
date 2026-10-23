/** 1536 → «1,5 КБ» / «1.5 KB»: підписи й мова — з перекладів. */
export function formatSize(bytes: number, locale: string, units: readonly string[]): string {
  let value = Math.max(0, bytes);
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toLocaleString(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${units[unit]}`;
}
