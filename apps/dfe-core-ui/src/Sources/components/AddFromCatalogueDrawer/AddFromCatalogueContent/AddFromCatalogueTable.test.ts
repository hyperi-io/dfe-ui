import { describe, expect, it } from 'vitest';
import { toSourceName } from './AddFromCatalogueTable';

describe('toSourceName', () => {
  it('drops underscores and spells each digit', () => {
    expect(toSourceName('aws_cloudtrail')).toBe('awscloudtrail');
    expect(toSourceName('es_8_0')).toBe('eseightzero');
    expect(toSourceName('o365')).toBe('othreesixfive');
    expect(toSourceName('okta')).toBe('okta');
  });
});
