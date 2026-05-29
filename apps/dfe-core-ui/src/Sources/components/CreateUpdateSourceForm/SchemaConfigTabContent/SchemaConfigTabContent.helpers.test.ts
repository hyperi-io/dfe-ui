import { describe, expect, test } from 'vitest';
import { getInitialAssignSchema } from './SchemaConfigTabContent.helpers';

describe('getInitialAssignSchema', () => {
  test('when meta_schema is not provided, should return default', () => {
    const result = getInitialAssignSchema({ meta_schema: null });
    expect(result).toBe('default');
  });

  test('when meta_schema is provided, should return define_schema', () => {
    const result = getInitialAssignSchema({ meta_schema: 'meta_schema' });
    expect(result).toBe('define_schema');
  });
});
