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

const JSON_MIME_TYPES = new Set(['application/json']);

export const isJsonFile = (file: File): boolean => {
  const rawType = file.type?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (rawType && JSON_MIME_TYPES.has(rawType)) {
    return true;
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith('.json')) {
    return false;
  }

  return (
    rawType === '' ||
    rawType === 'application/octet-stream' ||
    rawType === 'text/plain'
  );
};
