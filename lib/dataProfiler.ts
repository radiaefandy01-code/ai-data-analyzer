export type ColumnType = "numeric" | "category" | "text";

export type ColumnProfile = {
  name: string;
  type: ColumnType;
  missing: number;
  unique: number;
  min?: number;
  max?: number;
  average?: number;
  categories?: Record<string, number>;
};

export type DataProfile = {
  rows: number;
  columns: number;
  totalMissing: number;
  columnProfiles: ColumnProfile[];
};

export function profileData(data: string[][]): DataProfile {
  if (data.length < 2) {
    return {
      rows: 0,
      columns: data[0]?.length ?? 0,
      totalMissing: 0,
      columnProfiles: [],
    };
  }

  const headers = data[0];
  const rows = data.slice(1);

  const columnProfiles: ColumnProfile[] = headers.map(
    (header, columnIndex) => {
      const values = rows.map((row) =>
        (row[columnIndex] ?? "").trim()
      );

      const nonEmptyValues = values.filter(
        (value) => value !== ""
      );

      const missing = values.length - nonEmptyValues.length;

      const uniqueValues = new Set(nonEmptyValues);

      const numericValues = nonEmptyValues
        .map(Number)
        .filter((value) => !Number.isNaN(value));

      const isNumeric =
        nonEmptyValues.length > 0 &&
        numericValues.length === nonEmptyValues.length;

      if (isNumeric) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);

        const average =
          numericValues.reduce(
            (sum, value) => sum + value,
            0
          ) / numericValues.length;

        return {
          name: header,
          type: "numeric",
          missing,
          unique: uniqueValues.size,
          min,
          max,
          average,
        };
      }

      const categories: Record<string, number> = {};

      nonEmptyValues.forEach((value) => {
        categories[value] = (categories[value] ?? 0) + 1;
      });

      const isCategory =
        uniqueValues.size <= Math.max(10, rows.length * 0.5);

      return {
        name: header,
        type: isCategory ? "category" : "text",
        missing,
        unique: uniqueValues.size,
        categories: isCategory ? categories : undefined,
      };
    }
  );

  const totalMissing = columnProfiles.reduce(
    (total, column) => total + column.missing,
    0
  );

  return {
    rows: rows.length,
    columns: headers.length,
    totalMissing,
    columnProfiles,
  };
}