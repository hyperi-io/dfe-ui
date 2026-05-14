import { describe, expect, test } from 'vitest';
import { transformDataToUploadedSchemaRow } from './SchemaUploadFileSection.helpers';

describe('transformDataToUploadedSchemaRow', () => {
  test('transforms data to uploaded schema row', () => {
    const data = [{ name: 'col_a', type: 'String' }];
    const result = transformDataToUploadedSchemaRow(data);
    expect(result).toEqual([
      { id: '1', name: 'col_a', type: 'String', imported: true },
    ]);
  });
});
