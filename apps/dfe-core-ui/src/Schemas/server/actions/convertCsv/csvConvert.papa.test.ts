import Papa from 'papaparse';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { parseCsvToObjects } from './csvConvert.papa';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseCsvToObjects', () => {
  test('parses header row into trimmed object keys and values', async () => {
    const file = new File([' id , name \n 1 , Alice '], 'data.csv', {
      type: 'text/csv',
    });

    await expect(parseCsvToObjects(file)).resolves.toEqual([
      { id: '1', name: 'Alice' },
    ]);
  });

  test('skips empty lines', async () => {
    const file = new File(['a,b\n\n1,2\n'], 'data.csv', { type: 'text/csv' });

    await expect(parseCsvToObjects(file)).resolves.toEqual([
      { a: '1', b: '2' },
    ]);
  });

  test('rejects when Papa reports row errors in complete', async () => {
    vi.spyOn(Papa, 'parse').mockImplementation((_input, config) => {
      config.complete?.({
        data: [],
        errors: [
          {
            type: 'Quotes',
            code: 'MissingQuotes',
            message: 'Unclosed quote',
            row: 2,
          },
        ],
        meta: {} as Papa.ParseMeta,
      });
    });

    const file = new File(['x'], 'data.csv', { type: 'text/csv' });

    await expect(parseCsvToObjects(file)).rejects.toThrow(
      'Unable to parse CSV. [Row2]-Unclosed quote',
    );
  });

  test('rejects when Papa invokes the error callback', async () => {
    vi.spyOn(Papa, 'parse').mockImplementation((_input, config) => {
      config.error?.(new Error('stream read failed'));
    });

    const file = new File(['x'], 'data.csv', { type: 'text/csv' });

    await expect(parseCsvToObjects(file)).rejects.toThrow('stream read failed');
  });

  test('propagates synchronous failures from Papa.parse', async () => {
    vi.spyOn(Papa, 'parse').mockImplementation(() => {
      throw new Error('internal parse failure');
    });

    const file = new File(['x'], 'data.csv', { type: 'text/csv' });

    await expect(parseCsvToObjects(file)).rejects.toThrow(
      'internal parse failure',
    );
  });
});
