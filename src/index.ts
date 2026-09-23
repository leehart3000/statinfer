export function mean(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("mean() needs at least one value");
  }
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}