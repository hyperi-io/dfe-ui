import { describe, expect, test } from 'vitest';
import { convertCsv } from './index';

describe('convertCsv', () => {
  test('returns empty array when file is missing', async () => {
    await expect(convertCsv(undefined as unknown as File)).resolves.toEqual([]);
  });

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

  test('accepts .csv by filename when MIME is empty', async () => {
    const f = new File(['k,v\na,b'], 'export.csv', { type: '' });
    await expect(convertCsv(f)).resolves.toEqual([{ k: 'a', v: 'b' }]);
  });
});
