import {
  INDEX_USE_CASE_LABELS,
  INDEX_USE_CASE_OPTIONS,
  resolveIndexUseCase,
} from '@/Schemas/constants/indexUseCase';
import { describe, expect, it } from 'vitest';

describe('resolveIndexUseCase', () => {
  it('keeps a use case that is already current', () => {
    expect(resolveIndexUseCase('dimension')).toBe('dimension');
    expect(resolveIndexUseCase('key_search')).toBe('key_search');
  });

  it('maps the pre-rename vocabulary a base column may still carry', () => {
    expect(resolveIndexUseCase('fulltext')).toBe('word_search');
    expect(resolveIndexUseCase('text_search')).toBe('substring_search');
    expect(resolveIndexUseCase('bloom')).toBe('exact_match');
  });

  it('treats an empty, missing or unknown value as no index', () => {
    expect(resolveIndexUseCase(undefined)).toBe('none');
    expect(resolveIndexUseCase(null)).toBe('none');
    expect(resolveIndexUseCase('  ')).toBe('none');
    expect(resolveIndexUseCase('tokenbf_v1')).toBe('none');
  });

  it('ignores case and surrounding space', () => {
    expect(resolveIndexUseCase(' Fulltext ')).toBe('word_search');
  });
});

describe('index use case labels', () => {
  it('names the question, never the ClickHouse primitive', () => {
    const labels = Object.values(INDEX_USE_CASE_LABELS).join(' ').toLowerCase();
    for (const primitive of [
      'set(0)',
      'minmax',
      'bloom_filter',
      'tokenbf',
      'ngrambf',
      'tokenizer',
      'granularity',
    ]) {
      expect(labels).not.toContain(primitive);
    }
  });

  it('offers every use case as an option', () => {
    expect(INDEX_USE_CASE_OPTIONS.map((option) => option.value)).toEqual([
      'dimension',
      'exact_match',
      'range',
      'word_search',
      'substring_search',
      'key_search',
      'none',
    ]);
    expect(
      INDEX_USE_CASE_OPTIONS.find((option) => option.value === 'word_search')
        ?.label,
    ).toBe('I search for whole words');
  });
});
