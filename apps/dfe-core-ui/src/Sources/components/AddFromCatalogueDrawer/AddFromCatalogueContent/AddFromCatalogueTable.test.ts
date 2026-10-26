import { describe, expect, it } from 'vitest';
import { toSourceName } from './AddFromCatalogueTable';

describe('toSourceName', () => {
  it('turns underscores into hyphens and spells the first digit', () => {
    expect(toSourceName('aws_cloudtrail')).toBe('aws-cloudtrail');
    expect(toSourceName('es_8_0')).toBe('es-eight-0');
    expect(toSourceName('o365')).toBe('othree65');
    expect(toSourceName('okta')).toBe('okta');
  });
});
