'use server';

import { isCsvFile, parseCsvToObjects } from './csvConvert.helpers';

export interface CsvRow {
  [key: string]: string | boolean | string[];
}

export const convertCsv = async (file: File): Promise<CsvRow[]> => {
  if (!file) {
    return [];
  }

  if (!(file instanceof File)) {
    throw new Error('File is not a File');
  }

  if (!isCsvFile(file)) {
    throw new Error('Upload must be a CSV file (text/csv or a .csv filename).');
  }

  const raw = await file.text();
  if (!raw.trim()) {
    return [];
  }

  try {
    const data = parseCsvToObjects(raw);
    return data;
  } catch {
    throw new Error('Could not parse CSV content.');
  }
};
