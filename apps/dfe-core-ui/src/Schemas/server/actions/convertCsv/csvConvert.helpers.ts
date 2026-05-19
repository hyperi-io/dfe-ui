const CSV_MIME_TYPES = new Set(['text/csv', 'application/csv']);

export const isCsvFile = (file: File): boolean => {
  const rawType = file.type?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (rawType && CSV_MIME_TYPES.has(rawType)) {
    return true;
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith('.csv')) {
    return false;
  }

  return (
    rawType === '' ||
    rawType === 'application/octet-stream' ||
    rawType === 'text/plain'
  );
};

/** RFC 4180–style parse: quoted fields, escaped quotes, newlines inside quotes. */
export const parseCsvToObjects = (
  csvText: string,
): Record<string, string>[] => {
  const text = csvText.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i]!;

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += c;
      i++;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(cell);
      cell = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i++;
      continue;
    }
    cell += c;
    i++;
  }

  row.push(cell);
  rows.push(row);

  while (rows.length > 0 && rows[rows.length - 1]!.every((v) => v === '')) {
    rows.pop();
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0]!.map((h) => h.trim());
  const data = rows.slice(1).map((values) => {
    const obj: Record<string, string> = {};
    headers.forEach((key, idx) => {
      if (key) {
        obj[key] = values[idx] ?? '';
      }
    });
    return obj;
  });
  return data;
};
