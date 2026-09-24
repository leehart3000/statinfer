/**
 * Ranks values from 1 (smallest) upwards. Tied values share the average
 * of the ranks they cover, e.g. two values tied for 2nd both get 2.5.
 */
export function rank(values: readonly number[]): number[] {
  const n = values.length;
  const order = values.map((_, i) => i).sort((a, b) => values[a]! - values[b]!);
  const ranks = new Array<number>(n);

  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && values[order[j + 1]!] === values[order[i]!]) j++;
    const averageRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[order[k]!] = averageRank;
    i = j + 1;
  }
  return ranks;
}