import { SCHEMA_VOCABULARY_FIXTURE } from '@/core/hooks/useFetchSchemaVocabulary/vocabulary.fixture';
import {
  indexUseCaseOptions,
  resolveIndexUseCase,
} from '@/Schemas/constants/indexUseCase';
import { describe, expect, it } from 'vitest';

const vocabulary = SCHEMA_VOCABULARY_FIXTURE;

describe('resolveIndexUseCase', () => {
  it('keeps a use case the vocabulary has', () => {
    expect(resolveIndexUseCase('dimension', vocabulary)).toBe('dimension');
    expect(resolveIndexUseCase('key_search', vocabulary)).toBe('key_search');
  });

  it('maps a retired name to the use case that replaced it', () => {
    expect(resolveIndexUseCase('fulltext', vocabulary)).toBe('word_search');
    expect(resolveIndexUseCase('text_search', vocabulary)).toBe(
      'substring_search',
    );
    expect(resolveIndexUseCase('bloom', vocabulary)).toBe('exact_match');
  });

  it('treats an empty, missing or unknown value as no index', () => {
    expect(resolveIndexUseCase(undefined, vocabulary)).toBe('none');
    expect(resolveIndexUseCase(null, vocabulary)).toBe('none');
    expect(resolveIndexUseCase('  ', vocabulary)).toBe('none');
    expect(resolveIndexUseCase('tokenbf_v1', vocabulary)).toBe('none');
  });

  it('ignores case and surrounding space', () => {
    expect(resolveIndexUseCase(' Fulltext ', vocabulary)).toBe('word_search');
  });
});

describe('indexUseCaseOptions', () => {
  it('offers the use cases that take no argument, then no index', () => {
    expect(
      indexUseCaseOptions(vocabulary).map((option) => option.value),
    ).toEqual([
      'dimension',
      'exact_match',
      'range',
      'word_search',
      'substring_search',
      'key_search',
      'none',
    ]);
  });

  it('labels each by name and gives the question it answers as the hint, never a ClickHouse primitive', () => {
    const options = indexUseCaseOptions(vocabulary);

    expect(options.find((option) => option.value === 'word_search')).toEqual({
      label: 'Word search',
      value: 'word_search',
      title: 'I search for whole words',
    });
    const text = options
      .flatMap((option) => [option.label, option.title])
      .join(' ')
      .toLowerCase();
    for (const primitive of ['set(0)', 'minmax', 'bloom_filter', 'tokenbf']) {
      expect(text).not.toContain(primitive);
    }
  });

  it('has no hint when a use case has no description', () => {
    const bare = {
      ...vocabulary,
      use_cases: [{ ...vocabulary.use_cases[0], description: '' }],
    };

    expect(indexUseCaseOptions(bare)[0]).toEqual({
      label: 'Dimension',
      value: 'dimension',
      title: undefined,
    });
  });
});
