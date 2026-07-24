import { describe, expect, test } from 'vitest';

import {
  customMappingsEntriesToRecord,
  customMappingsRecordToEntries,
} from './customMappingsTransform';

describe('customMappingsTransform', () => {
  test('customMappingsEntriesToRecord converts form pairs to API record', () => {
    expect(
      customMappingsEntriesToRecord([
        { key: 'EventID', value: 'event_id' },
        { key: 'UserName', value: 'user_name' },
      ]),
    ).toEqual({
      EventID: 'event_id',
      UserName: 'user_name',
    });
  });

  test('customMappingsEntriesToRecord returns undefined for empty input', () => {
    expect(customMappingsEntriesToRecord([])).toBeUndefined();
    expect(customMappingsEntriesToRecord(undefined)).toBeUndefined();
  });

  test('customMappingsRecordToEntries converts API record to form pairs', () => {
    expect(
      customMappingsRecordToEntries({
        EventID: 'event_id',
        UserName: 'user_name',
      }),
    ).toEqual([
      { key: 'EventID', value: 'event_id' },
      { key: 'UserName', value: 'user_name' },
    ]);
  });

  test('customMappingsRecordToEntries returns undefined for empty input', () => {
    expect(customMappingsRecordToEntries({})).toBeUndefined();
    expect(customMappingsRecordToEntries(null)).toBeUndefined();
    expect(customMappingsRecordToEntries(undefined)).toBeUndefined();
  });
});
