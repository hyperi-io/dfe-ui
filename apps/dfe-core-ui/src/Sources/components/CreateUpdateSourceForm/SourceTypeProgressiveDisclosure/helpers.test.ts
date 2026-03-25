import { components } from '@repo/dfe-engine-types';
import { describe, expect, test } from 'vitest';
import { getInitialSourceType } from './helpers';

const MATCH: components['schemas']['SourceMatch'] = {
  field: 'field',
  value: 'value',
};
const FETCHER: components['schemas']['SourceFetcher'] = {
  source_type: 'source_type',
  base_url: 'base_url',
  auth: null,
  poll_interval_secs: 10,
};

describe('getInitialSourceType', () => {
  test('when match and fetcher are provided, should return null', () => {
    const result = getInitialSourceType({ match: MATCH, fetcher: FETCHER });
    expect(result).toBe(null);
  });

  test('when fetcher is provided, should return fetcher', () => {
    const result = getInitialSourceType({
      match: null,
      fetcher: {
        source_type: 'source_type',
        base_url: 'base_url',
        auth: null,
        poll_interval_secs: 10,
      },
    });
    expect(result).toBe('fetcher');
  });

  test('when match is provided, should return receiver', () => {
    const result = getInitialSourceType({ match: MATCH, fetcher: null });
    expect(result).toBe('receiver');
  });

  test('when neither match nor fetcher are provided, should return null', () => {
    const result = getInitialSourceType({ match: null, fetcher: null });
    expect(result).toBe(null);
  });
});
