import { OKTA_CATALOGUE_ENTRY } from '@/core/config/api/endpoints/generator/mocks/sources';
import { describe, expect, it } from 'vitest';
import { toSelectedEntry, toSourceName } from './AddFromCatalogueTable';

describe('toSourceName', () => {
  it('turns underscores into hyphens and spells the first digit', () => {
    expect(toSourceName('aws_cloudtrail')).toBe('aws-cloudtrail');
    expect(toSourceName('es_8_0')).toBe('es-eight-0');
    expect(toSourceName('o365')).toBe('othree65');
    expect(toSourceName('okta')).toBe('okta');
  });
});

describe('toSelectedEntry', () => {
  it("starts on the engine's default intake, not the first one listed", () => {
    expect(toSelectedEntry(OKTA_CATALOGUE_ENTRY)).toEqual({
      entry: 'okta',
      name: 'okta',
      intake: 'fetcher',
      transport: 'bus',
      archive: false,
      intakeOptions: ['beats', 'fetcher'],
    });
  });
});
