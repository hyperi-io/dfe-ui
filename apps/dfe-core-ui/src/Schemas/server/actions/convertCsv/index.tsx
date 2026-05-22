'use server';

import { isCsvFile } from './csvConvert.helpers';
import { parseCsvToObjects } from './csvConvert.papa';

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

  return await parseCsvToObjects(file);
};
