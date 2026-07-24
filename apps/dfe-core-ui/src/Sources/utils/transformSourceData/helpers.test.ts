import { describe, expect, test } from 'vitest';

import { objectArrayToObject, objectToObjectArray } from './helpers';

describe('customMappingsTransform', () => {
  test('customMappingsEntriesToRecord converts form pairs to API record', () => {
    expect(
      objectArrayToObject([
        { key: 'EventID', value: 'event_id' },
        { key: 'UserName', value: 'user_name' },
      ]),
    ).toEqual({
      EventID: 'event_id',
      UserName: 'user_name',
    });
  });

  test('customMappingsEntriesToRecord returns undefined for empty input', () => {
    expect(objectArrayToObject([])).toBeUndefined();
    expect(objectArrayToObject(undefined)).toBeUndefined();
  });

  test('customMappingsRecordToEntries converts API record to form pairs', () => {
    expect(
      objectToObjectArray({
        EventID: 'event_id',
        UserName: 'user_name',
      }),
    ).toEqual([
      { key: 'EventID', value: 'event_id' },
      { key: 'UserName', value: 'user_name' },
    ]);
  });

  test('customMappingsRecordToEntries returns undefined for empty input', () => {
    expect(objectToObjectArray({})).toBeUndefined();
    expect(objectToObjectArray(null)).toBeUndefined();
    expect(objectToObjectArray(undefined)).toBeUndefined();
  });
});
