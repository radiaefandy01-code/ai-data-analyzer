export interface ColumnQuality {
  name: string;
  total: number;
  missing: number;
  completeness: number;
  unique: number;
  uniqueRatio: number;
}

export interface DataQualityResult {
  totalRows: number;
  totalColumns: number;
  totalCells: number;
  missingValues: number;
  completeness: number;
  duplicateRows: number;
  duplicateRate: number;
  overallScore: number;
  columnQuality: ColumnQuality[];
}

export function analyzeDataQuality(
  data: string[][]
): DataQualityResult {
  if (data.length < 2) {
    return {
      totalRows: 0,
      totalColumns: data[0]?.length ?? 0,
      totalCells: 0,
      missingValues: 0,
      completeness: 100,
      duplicateRows: 0,
      duplicateRate: 0,
      overallScore: 100,
      columnQuality: [],
    };
  }

  const headers = data[0];
  const rows = data.slice(1);

  const totalRows = rows.length;
  const totalColumns = headers.length;
  const totalCells = totalRows * totalColumns;

  let missingValues = 0;

  const columnQuality: ColumnQuality[] = headers.map(
    (header, columnIndex) => {
      const values = rows.map(
        (row) => (row[columnIndex] ?? "").trim()
      );

      const missing = values.filter(
        (value) => value === ""
      ).length;

      const nonEmptyValues = values.filter(
        (value) => value !== ""
      );

      const unique = new Set(nonEmptyValues).size;

      const completeness =
        totalRows === 0
          ? 100
          : ((totalRows - missing) / totalRows) * 100;

      const uniqueRatio =
        nonEmptyValues.length === 0
          ? 0
          : (unique / nonEmptyValues.length) * 100;

      missingValues += missing;

      return {
        name: header,
        total: totalRows,
        missing,
        completeness,
        unique,
        uniqueRatio,
      };
    }
  );

  const completeness =
    totalCells === 0
      ? 100
      : ((totalCells - missingValues) / totalCells) * 100;

  // Deteksi duplicate rows
  const rowKeys = rows.map((row) =>
    row
      .map((value) => value.trim())
      .join("||")
  );

  const uniqueRows = new Set(rowKeys).size;

  const duplicateRows = totalRows - uniqueRows;

  const duplicateRate =
    totalRows === 0
      ? 0
      : (duplicateRows / totalRows) * 100;

  /*
   * Quality score sederhana:
   *
   * 70% completeness
   * 30% uniqueness / duplicate quality
   */
  const uniquenessScore =
    100 - duplicateRate;

  const overallScore =
    completeness * 0.7 +
    uniquenessScore * 0.3;

  return {
    totalRows,
    totalColumns,
    totalCells,
    missingValues,
    completeness,
    duplicateRows,
    duplicateRate,
    overallScore,
    columnQuality,
  };
}