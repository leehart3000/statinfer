/** Turns "1, 2 3\n4" into [1, 2, 3, 4], or throws a readable error. */
export function parseNumbers(text: string): number[] {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  const values = parts.map(Number);
  const bad = parts.find((_, i) => !Number.isFinite(values[i]));
  if (bad !== undefined) throw new Error(`"${bad}" is not a number`);
  return values;
}

/** Rounds to 4 significant digits for display, e.g. 5.178800255 → "5.179". */
export const fmt = (n: number) => String(Number(n.toPrecision(4)));

/** Reads one number from a form field, or throws "<label> must be a number". */
export function parseNumber(text: string, label: string): number {
  const value = Number(text);
  if (text.trim() === "" || !Number.isFinite(value)) throw new Error(`${label} must be a number`);
  return value;
}

/** Turns "1, 2\n3, 4" into [[1, 2], [3, 4]]: one row per line. */
export function parseTable(text: string): number[][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseNumbers);
}
