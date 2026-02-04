/**
 * Escape a value for CSV (wrap in quotes if contains comma, newline, or quote).
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export type CsvColumn<T> = {
  key: keyof T | ((row: T) => unknown);
  header: string;
};

/**
 * Export an array of objects to CSV and trigger download.
 * @param data Array of row objects
 * @param filename Download filename (e.g. "members.csv")
 * @param columns Optional column config; if omitted, keys from first row are used (nested objects stringified)
 */
export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: CsvColumn<T>[]
): void {
  if (data.length === 0) {
    const headers = columns
      ? columns.map((c) => c.header)
      : [];
    const blob = new Blob([headers.join(',') + '\n'], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const cols = columns ?? (Object.keys(data[0]) as (keyof T)[]).map((key) => ({
    key,
    header: String(key),
  })) as CsvColumn<T>[];

  const headerRow = cols.map((c) => escapeCsvValue(c.header)).join(',');

  const bodyRows = data.map((row) =>
    cols
      .map((col) => {
        const value =
          typeof col.key === 'function'
            ? (col.key as (row: T) => unknown)(row)
            : row[col.key];
        return escapeCsvValue(value);
      })
      .join(',')
  );

  const csv = [headerRow, ...bodyRows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
