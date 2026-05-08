import { describe, expect, test } from 'vitest';
import { isCsvFile, parseCsvToObjects } from './csvConvert.helpers';

const file = (
  name: string,
  content: BlobPart[],
  type: string | undefined = '',
): File =>
  new File(content, name, type !== undefined ? { type } : undefined);

describe('isCsvFile', () => {
  test('returns true for text/csv MIME', () => {
    expect(isCsvFile(file('data.tsv', [], 'text/csv'))).toBe(true);
  });

  test('returns true for application/csv MIME', () => {
    expect(isCsvFile(file('data', [], 'application/csv'))).toBe(true);
  });

  test('strips parameters from MIME (e.g. charset)', () => {
    expect(isCsvFile(file('x.csv', [], 'text/csv; charset=utf-8'))).toBe(true);
  });

  test('returns false for non-CSV MIME when extension is not .csv', () => {
    expect(isCsvFile(file('data.txt', [], 'text/plain'))).toBe(false);
  });

  test('returns true for .csv with empty type', () => {
    expect(isCsvFile(file('export.csv', [], ''))).toBe(true);
  });

  test('returns true for .csv with application/octet-stream', () => {
    expect(
      isCsvFile(file('export.csv', [], 'application/octet-stream')),
    ).toBe(true);
  });

  test('returns true for .csv with text/plain', () => {
    expect(isCsvFile(file('export.csv', [], 'text/plain'))).toBe(true);
  });

  test('returns false for .csv with unrelated MIME (e.g. image/png)', () => {
    expect(isCsvFile(file('fake.csv', [], 'image/png'))).toBe(false);
  });

  test('is case-insensitive on extension and MIME', () => {
    expect(isCsvFile(file('Export.CSV', [], 'TEXT/CSV'))).toBe(true);
  });
});

describe('parseCsvToObjects', () => {
  test('returns empty array for empty input', () => {
    expect(parseCsvToObjects('')).toEqual([]);
  });

  test('strips BOM and parses headers and rows', () => {
    const csv = '\uFEFFname,value\na,1\nb,2';
    expect(parseCsvToObjects(csv)).toEqual([
      { name: 'a', value: '1' },
      { name: 'b', value: '2' },
    ]);
  });

  test('trims header names', () => {
    expect(parseCsvToObjects('  id  , label \n1,x')).toEqual([
      { id: '1', label: 'x' },
    ]);
  });

  test('skips columns with empty header keys', () => {
    const result = parseCsvToObjects('a,,b\n1,2,3');
    expect(result).toEqual([{ a: '1', b: '3' }]);
    expect('' in result[0]!).toBe(false);
  });

  test('handles quoted fields with commas', () => {
    const csv = 'col\n"a, b"';
    expect(parseCsvToObjects(csv)).toEqual([{ col: 'a, b' }]);
  });

  test('handles escaped quotes (doubled double-quotes)', () => {
    const csv = 'col\n"""hello"""';
    expect(parseCsvToObjects(csv)).toEqual([{ col: '"hello"' }]);
  });

  test('handles newlines inside quoted fields', () => {
    const csv = 'col\n"line1\nline2"';
    expect(parseCsvToObjects(csv)).toEqual([{ col: 'line1\nline2' }]);
  });

  test('ignores carriage returns outside quotes', () => {
    const csv = 'a,b\r\n1,2\r\n';
    expect(parseCsvToObjects(csv)).toEqual([{ a: '1', b: '2' }]);
  });

  test('drops trailing rows that are all empty cells', () => {
    const csv = 'h\nv\n\n\n';
    expect(parseCsvToObjects(csv)).toEqual([{ h: 'v' }]);
  });

  test('pads missing trailing columns with empty string', () => {
    const csv = 'a,b,c\n1,2';
    expect(parseCsvToObjects(csv)).toEqual([{ a: '1', b: '2', c: '' }]);
  });
});
