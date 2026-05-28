import { describe, expect, test, vi } from 'vitest';
import { transformDataToUploadedSchemaRow } from './SchemaUploadFileSection.helpers';

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('1'),
}));

describe('transformDataToUploadedSchemaRow', () => {
  test('transforms data to uploaded schema row', () => {
    const data = [{ name: 'col_a', type: 'String' }];
    const result = transformDataToUploadedSchemaRow(data);
    expect(result).toEqual([
      { id: '1', name: 'col_a', type: 'String', imported: true },
    ]);
  });
});
