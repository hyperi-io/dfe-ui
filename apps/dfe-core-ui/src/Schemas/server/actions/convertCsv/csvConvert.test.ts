import { describe, expect, test, vi, afterEach } from 'vitest';
import * as csvHelpers from './csvConvert.helpers';
import { convertCsv } from './index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('convertCsv', () => {
  test('throws when value is not a File', async () => {
    await expect(
      convertCsv(new Blob(['a']) as unknown as File),
    ).rejects.toThrow('File is not a File');
  });

  test('throws when file is not recognized as CSV', async () => {
    const f = new File(['x'], 'notes.txt', { type: 'text/plain' });
    await expect(convertCsv(f)).rejects.toThrow(
      'Upload must be a CSV file (text/csv or a .csv filename).',
    );
  });

  test('returns empty array for empty file content', async () => {
    const f = new File([''], 'data.csv', { type: 'text/csv' });
    await expect(convertCsv(f)).resolves.toEqual([]);
  });

  test('returns empty array for whitespace-only content', async () => {
    const f = new File(['   \n  '], 'data.csv', { type: 'text/csv' });
    await expect(convertCsv(f)).resolves.toEqual([]);
  });

  test('parses CSV and returns row objects', async () => {
    const f = new File(['id,name\n1,Alice\n2,Bob'], 'data.csv', {
      type: 'text/csv',
    });
    await expect(convertCsv(f)).resolves.toEqual([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]);
  });

  test('rethrows parse errors as a user-facing message', async () => {
    vi.spyOn(csvHelpers, 'parseCsvToObjects').mockImplementation(() => {
      throw new Error('internal parse failure');
    });
    const f = new File(['x'], 'data.csv', { type: 'text/csv' });
    await expect(convertCsv(f)).rejects.toThrow('Could not parse CSV content.');
  });
});
