/**
 * Index use cases: the question the user wants to ask of a column.
 *
 * The engine turns the use case into a ClickHouse index, so nothing here names
 * an index type, a tokenizer or a granularity.
 */
export const INDEX_USE_CASES = [
  'dimension',
  'exact_match',
  'range',
  'word_search',
  'substring_search',
  'key_search',
  'none',
] as const;

export type IndexUseCase = (typeof INDEX_USE_CASES)[number];

/** The question each use case answers, which is what the picker shows. */
export const INDEX_USE_CASE_LABELS: Record<IndexUseCase, string> = {
  dimension: 'I filter and group by this',
  exact_match: 'I look up specific values',
  range: 'I query ranges, between, time windows',
  word_search: 'I search for whole words',
  substring_search: 'I search for fragments inside words',
  key_search: 'I search the keys and values of a map column',
  none: 'No index',
};

export const INDEX_USE_CASE_OPTIONS: {
  label: string;
  value: IndexUseCase;
}[] = INDEX_USE_CASES.map((useCase) => ({
  label: INDEX_USE_CASE_LABELS[useCase],
  value: useCase,
}));

/** A base column written before the rename still carries the old name. */
const RENAMED_INDEX_USE_CASES: Record<string, IndexUseCase> = {
  fulltext: 'word_search',
  text_search: 'substring_search',
  bloom: 'exact_match',
};

const isIndexUseCase = (value: string): value is IndexUseCase =>
  (INDEX_USE_CASES as readonly string[]).includes(value);

/**
 * A base column's index use case in the current vocabulary.
 *
 * Returns `none` for a column with no index and for a value this build does not
 * know, so an unreadable base never turns into an index nobody asked for.
 */
export const resolveIndexUseCase = (
  value: string | null | undefined,
): IndexUseCase => {
  const normalised = (value ?? '').trim().toLowerCase();
  if (normalised === '') {
    return 'none';
  }
  if (isIndexUseCase(normalised)) {
    return normalised;
  }
  return RENAMED_INDEX_USE_CASES[normalised] ?? 'none';
};
