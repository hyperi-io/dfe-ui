import { describe, expect, test } from 'vitest';
import { getInitialAssignTransform } from './TransformTabContent.helpers';

describe('getInitialAssignTransform', () => {
  test('when transform engine is missing, should return none', () => {
    expect(getInitialAssignTransform(undefined)).toBe('none');
    expect(getInitialAssignTransform(null)).toBe('none');
    expect(getInitialAssignTransform({ engine: '' })).toBe('none');
  });

  test('when transform engine is provided, should return define_transform', () => {
    expect(
      getInitialAssignTransform({
        engine: 'vector',
        config_file: null,
      }),
    ).toBe('define_transform');
  });
});
