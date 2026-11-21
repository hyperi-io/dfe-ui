import { describe, expect, test } from 'vitest';
import { accountNameSchema } from './accountName.schema';

describe('accountNameSchema', () => {
  test.each([
    { required: true, name: 'Kaz', accepted: true },
    { required: true, name: '', accepted: false },
    { required: true, name: '   ', accepted: false },
    { required: true, name: undefined, accepted: false },
    { required: false, name: '', accepted: true },
    { required: false, name: undefined, accepted: true },
    { required: false, name: null, accepted: true },
  ])(
    'with required $required, $name is accepted: $accepted',
    ({ required, name, accepted }) => {
      expect(accountNameSchema(required).safeParse(name).success).toBe(
        accepted,
      );
    },
  );
});
