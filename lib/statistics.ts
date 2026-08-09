export interface NumericStatistics {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  range: number;
  standardDeviation: number;
  q1: number;
  q3: number;
  iqr: number;
  outliers: number[];
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function percentile(values: number[], percentileValue: number): number {
  const sorted = [...values].sort((a, b) => a - b);

  if (sorted.length === 0) {
    return 0;
  }

  const index = (percentileValue / 100) * (sorted.length - 1);

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
}

export function calculateNumericStatistics(
  values: number[]
): NumericStatistics | null {
  const validValues = values.filter(
    (value) => Number.isFinite(value)
  );

  if (validValues.length === 0) {
    return null;
  }

  const sorted = [...validValues].sort((a, b) => a - b);

  const count = sorted.length;

  const mean =
    sorted.reduce((sum, value) => sum + value, 0) / count;

  const med = median(sorted);

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const range = max - min;

  const variance =
    sorted.reduce(
      (sum, value) => sum + Math.pow(value - mean, 2),
      0
    ) / count;

  const standardDeviation = Math.sqrt(variance);

  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);

  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = sorted.filter(
    (value) => value < lowerBound || value > upperBound
  );

  return {
    count,
    mean,
    median: med,
    min,
    max,
    range,
    standardDeviation,
    q1,
    q3,
    iqr,
    outliers,
  };
}