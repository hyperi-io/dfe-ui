import { describe, expect, test } from 'vitest';
import {
  createGroupFormSchema,
  CreateUpdateGroupFormData,
  GroupSourceLink,
} from './groupForm.schema';

const UNLINKED: GroupSourceLink = { source_id: '', source_provider: '' };
const LEGACY_LINK: GroupSourceLink = { source_id: 'abc', source_provider: '' };

const BASE: CreateUpdateGroupFormData = {
  name: 'viewers',
  description: '',
  roles: ['viewer'],
  members: [],
  scope: 'system',
  source_id: '',
  source_provider: '',
};

const messagesAt = (
  stored: GroupSourceLink,
  link: GroupSourceLink,
  field: keyof GroupSourceLink,
) => {
  const result = createGroupFormSchema(stored).safeParse({ ...BASE, ...link });
  if (result.success) return [];
  return result.error.issues
    .filter((issue) => issue.path.join('.') === field)
    .map((issue) => issue.message);
};

const TOO_LONG = 'Source ID is at most 512 characters';
const PROVIDER_REQUIRED = 'Source provider is required with a source ID';

describe('createGroupFormSchema source ID length', () => {
  test.each([
    ['exactly 512 characters', 'a'.repeat(512)],
    ['512 characters inside padding', ` ${'a'.repeat(512)} `],
    ['300 emoji, 600 UTF-16 units', '\u{1F600}'.repeat(300)],
  ])('accepts %s', (_label, source_id) => {
    expect(
      messagesAt(UNLINKED, { source_id, source_provider: 'okta' }, 'source_id'),
    ).toEqual([]);
  });

  test('refuses 513 characters', () => {
    expect(
      messagesAt(
        UNLINKED,
        { source_id: 'a'.repeat(513), source_provider: 'okta' },
        'source_id',
      ),
    ).toEqual([TOO_LONG]);
  });

  test('leaves a stored over-long source ID with a typed space alone', () => {
    const stored = { source_id: 'a'.repeat(600), source_provider: 'okta' };

    expect(
      messagesAt(
        stored,
        { ...stored, source_id: `${stored.source_id} ` },
        'source_id',
      ),
    ).toEqual([]);
  });
});

describe('createGroupFormSchema source provider', () => {
  test('a new source ID needs a provider', () => {
    expect(
      messagesAt(
        UNLINKED,
        { source_id: 'dfe-viewers', source_provider: '' },
        'source_provider',
      ),
    ).toEqual([PROVIDER_REQUIRED]);
  });

  test('an unchanged link with no provider is left alone', () => {
    expect(messagesAt(LEGACY_LINK, LEGACY_LINK, 'source_provider')).toEqual([]);
  });

  test('a typed space does not change a link with no provider', () => {
    expect(
      messagesAt(
        LEGACY_LINK,
        { ...LEGACY_LINK, source_id: 'abc ' },
        'source_provider',
      ),
    ).toEqual([]);
  });

  test('a changed source ID on a link with no provider needs one', () => {
    expect(
      messagesAt(
        LEGACY_LINK,
        { ...LEGACY_LINK, source_id: 'abd' },
        'source_provider',
      ),
    ).toEqual([PROVIDER_REQUIRED]);
  });

  test('clearing the source ID of a link with no provider is allowed', () => {
    expect(
      messagesAt(
        LEGACY_LINK,
        { ...LEGACY_LINK, source_id: '' },
        'source_provider',
      ),
    ).toEqual([]);
  });
});
