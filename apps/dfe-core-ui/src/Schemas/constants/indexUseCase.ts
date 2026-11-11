import type { TSchemaVocabularyResponse } from '@/core/hooks/useFetchSchemaVocabulary/types';

/**
 * Index use cases: the question the user wants to ask of a column.
 *
 * The engine owns the list and serves it with the schema vocabulary. It turns a
 * use case into a ClickHouse index, so nothing here names an index type, a
 * tokenizer or a granularity.
 */

/** A use case name from the engine's vocabulary, or {@link NO_INDEX}. */
export type IndexUseCase = string;

/** Not a use case of the engine's: the choice to carry no index. */
export const NO_INDEX = 'none';

/**
 * What the picker offers: the question each use case answers, then no index.
 * A use case that needs an argument is left out, because the picker cannot
 * take one and the engine refuses the bare name.
 */
export const indexUseCaseOptions = (
  vocabulary: TSchemaVocabularyResponse,
): { label: string; value: IndexUseCase }[] => [
  ...vocabulary.use_cases
    .filter(({ parameters }) => parameters.length === 0)
    .map(({ name, label, description }) => ({
      label: description || label,
      value: name,
    })),
  { label: 'No index', value: NO_INDEX },
];

/**
 * A base column's index use case in the current vocabulary.
 *
 * A name the engine retired maps to the one that replaced it. Returns `none`
 * for a column with no index and for a value the vocabulary does not know, so an
 * unreadable base never turns into an index nobody asked for.
 */
export const resolveIndexUseCase = (
  value: string | null | undefined,
  vocabulary: TSchemaVocabularyResponse,
): IndexUseCase => {
  const normalised = (value ?? '').trim().toLowerCase();
  if (normalised === '') {
    return NO_INDEX;
  }
  for (const useCase of vocabulary.use_cases) {
    if (useCase.name === normalised) {
      return useCase.name;
    }
    if (useCase.retired_names.includes(normalised)) {
      return useCase.name;
    }
  }
  return NO_INDEX;
};
