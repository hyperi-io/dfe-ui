import type { TSchemaVocabularyResponse } from './types';

type Vocabulary = TSchemaVocabularyResponse;

export const primitiveOptions = (vocabulary: Vocabulary) =>
  vocabulary.primitives.map(({ name, label }) => ({ label, value: name }));

export const attributeOptions = (vocabulary: Vocabulary) =>
  vocabulary.attributes.map(({ name, label }) => ({ label, value: name }));

export const cardinalityOptions = (vocabulary: Vocabulary) =>
  vocabulary.cardinality.values.map((name) => ({
    label: vocabulary.cardinality.labels[name] ?? name,
    value: name,
  }));

/**
 * The index use cases a column can take, labelled the same on every surface and
 * carrying the question each answers as its hint.
 *
 * With a `primitive` the engine knows, only the use cases valid for it are
 * offered. One that needs an argument, such as the dimension count of
 * `similarity_search`, is left out: the pickers have nowhere to type it, and the
 * engine refuses the bare name.
 */
export const indexOptionsFor = (vocabulary: Vocabulary, primitive?: string) => {
  const known = vocabulary.primitives.some(({ name }) => name === primitive);
  return vocabulary.use_cases
    .filter(({ parameters }) => parameters.length === 0)
    .filter(
      ({ valid_primitives }) =>
        !known || (primitive && valid_primitives.includes(primitive)),
    )
    .map(({ name, label, description }) => ({
      label,
      value: name,
      title: description || undefined,
    }));
};
