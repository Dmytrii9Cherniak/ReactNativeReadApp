/** Рядки файлу; переноси \r\n і \n однаково. */
export function splitLines(text: string): string[] {
  return text.split(/\r?\n/);
}

/** Кількість знаків від початку тексту до кінця кожного рядка: ends[i] = довжини рядків 0..i. */
export function lineEndOffsets(lines: readonly string[]): number[] {
  const ends: number[] = [];
  let total = 0;

  for (const line of lines) {
    total += line.length;
    ends.push(total);
  }

  return ends;
}
