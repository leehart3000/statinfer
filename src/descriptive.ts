export function mean(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("mean() needs at least one value");
  }
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

/** Sample variance (divides by n - 1). */
export function variance(values: readonly number[]): number {
  if (values.length < 2) {
    throw new RangeError("variance() needs at least two values");
  }
  const m = mean(values);
  let sumOfSquares = 0;
  for (const v of values) {
    const d = v - m;
    sumOfSquares += d * d;
  }
  return sumOfSquares / (values.length - 1);
}

/** Sample standard deviation. */
export function standardDeviation(values: readonly number[]): number {
  return Math.sqrt(variance(values));
}