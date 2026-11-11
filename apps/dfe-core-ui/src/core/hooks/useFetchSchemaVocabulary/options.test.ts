import { describe, expect, it } from 'vitest';
import {
  attributeOptions,
  cardinalityOptions,
  indexOptionsFor,
  primitiveOptions,
} from './options';
import { SCHEMA_VOCABULARY_FIXTURE } from './vocabulary.fixture';

const vocabulary = SCHEMA_VOCABULARY_FIXTURE;
const values = (options: { value: string }[]) =>
  options.map((option) => option.value);

describe('indexOptionsFor', () => {
  it('labels a use case by its label and carries the question as its hint', () => {
    expect(
      indexOptionsFor(vocabulary).find(
        (option) => option.value === 'word_search',
      ),
    ).toEqual({
      label: 'Word search',
      value: 'word_search',
      title: 'I search for whole words',
    });
  });

  it('leaves out a use case that needs an argument', () => {
    expect(values(indexOptionsFor(vocabulary))).not.toContain(
      'similarity_search',
    );
  });

  it.each([
    ['map', ['key_search']],
    ['integer', ['dimension', 'range']],
    ['string', ['dimension', 'exact_match', 'word_search', 'substring_search']],
  ])('offers only what is valid for a %s column', (primitive, expected) => {
    expect(values(indexOptionsFor(vocabulary, primitive))).toEqual(expected);
  });

  it.each([[undefined], [''], ['String']])(
    'does not filter for a type the vocabulary does not know (%s)',
    (primitive) => {
      expect(values(indexOptionsFor(vocabulary, primitive))).toEqual([
        'dimension',
        'exact_match',
        'range',
        'word_search',
        'substring_search',
        'key_search',
      ]);
    },
  );
});

describe('the other option lists', () => {
  it('labels cardinalities from the engine, in its order', () => {
    expect(cardinalityOptions(vocabulary)).toEqual([
      { label: 'Low', value: 'low' },
      { label: 'High', value: 'high' },
      { label: 'Unknown', value: 'unknown' },
    ]);
  });

  it('falls back to the value when a cardinality has no label', () => {
    const bare = {
      ...vocabulary,
      cardinality: { ...vocabulary.cardinality, labels: {} },
    };

    expect(cardinalityOptions(bare)[0]).toEqual({ label: 'low', value: 'low' });
  });

  it('offers every primitive and attribute with its label', () => {
    expect(primitiveOptions(vocabulary)).toContainEqual({
      label: 'Map',
      value: 'map',
    });
    expect(attributeOptions(vocabulary)).toContainEqual({
      label: 'Not null',
      value: 'not_null',
    });
  });
});
