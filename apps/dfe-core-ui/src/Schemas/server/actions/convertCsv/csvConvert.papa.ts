import { Readable } from 'node:stream';
import Papa from 'papaparse';

const parseConfig = {
  header: true,
  skipEmptyLines: true,
  delimiter: ',',
  transformHeader: (header: string) => header.trim(),
  transform: (value: string) => value.trim(),
} as const;

const papaInputFromFile = (file: File): File | Readable => {
  if (typeof FileReader !== 'undefined') {
    return file;
  }

  return Readable.fromWeb(
    file.stream() as Parameters<typeof Readable.fromWeb>[0],
  );
};

export const parseCsvToObjects = (
  file: File,
): Promise<Record<string, string>[]> => {
  const input = papaInputFromFile(file);

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(input, {
      ...parseConfig,
      complete: (results) => {
        const fatalErrors = results.errors;
        if (fatalErrors.length > 0) {
          reject(
            new Error(
              `Unable to parse CSV. ${fatalErrors.map((e) => `[Row${e.row}]-${e.message}`).join('; ')}`,
            ),
          );
          return;
        }
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};
