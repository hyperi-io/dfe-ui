import { describe, expect, test } from 'vitest';
import { isCsvFile, isJsonFile } from './csvConvert.helpers';

const file = (
  name: string,
  content: BlobPart[],
  type: string | undefined = '',
): File => new File(content, name, type !== undefined ? { type } : undefined);

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
    expect(isCsvFile(file('export.csv', [], 'application/octet-stream'))).toBe(
      true,
    );
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

describe('isJsonFile', () => {
  test('returns true for application/json MIME', () => {
    expect(isJsonFile(file('data.xml', [], 'application/json'))).toBe(true);
  });

  test('strips parameters from MIME (e.g. charset)', () => {
    expect(
      isJsonFile(file('x.json', [], 'application/json; charset=utf-8')),
    ).toBe(true);
  });

  test('returns false for non-JSON MIME when extension is not .json', () => {
    expect(isJsonFile(file('data.txt', [], 'text/plain'))).toBe(false);
  });

  test('returns true for .json with empty type', () => {
    expect(isJsonFile(file('export.json', [], ''))).toBe(true);
  });

  test('returns true for .json with application/octet-stream', () => {
    expect(
      isJsonFile(file('export.json', [], 'application/octet-stream')),
    ).toBe(true);
  });

  test('returns true for .json with text/plain', () => {
    expect(isJsonFile(file('export.json', [], 'text/plain'))).toBe(true);
  });

  test('returns false for .json with unrelated MIME (e.g. image/png)', () => {
    expect(isJsonFile(file('fake.json', [], 'image/png'))).toBe(false);
  });

  test('is case-insensitive on extension and MIME', () => {
    expect(isJsonFile(file('Export.JSON', [], 'APPLICATION/JSON'))).toBe(true);
  });
});
