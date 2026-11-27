'use server';

import { authOptions } from '@/core/config/auth';
import { isAppShellSession } from '@/core/config/authSession';
import { getServerSession } from 'next-auth';
import { isCsvFile } from './csvConvert.helpers';
import { parseCsvToObjects } from './csvConvert.papa';

export interface CsvRow {
  [key: string]: string | boolean | string[];
}

// A server action is reachable by a POST to any page, the self-guarded sign-in pages too, so it checks the session itself.
export const convertCsv = async (file: File): Promise<CsvRow[]> => {
  if (!isAppShellSession(await getServerSession(authOptions))) {
    throw new Error('Sign in to upload a schema.');
  }

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
