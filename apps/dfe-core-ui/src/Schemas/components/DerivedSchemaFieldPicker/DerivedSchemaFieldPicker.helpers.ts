import {
  IndexUseCase,
  resolveIndexUseCase,
} from '@/Schemas/constants/indexUseCase';

/**
 * One entry of a derived schema's `select` list.
 *
 * `index` is the only key a derived schema may add; type, expr, comment and
 * attribute resolve from the base column.
 */
export type DerivedSelectEntry = {
  name: string;
  index?: IndexUseCase;
};

/** A base column as the picker needs it: its name and the index it already carries. */
export type DerivedBaseColumn = {
  name: string;
  baseIndex: IndexUseCase;
};

export const baseColumnFrom = (column: {
  name?: string | null;
  use_case?: string | null;
}): DerivedBaseColumn => ({
  name: column.name ?? '',
  baseIndex: resolveIndexUseCase(column.use_case),
});

/** An omitted `index` keeps the base column's, so only a change is written. */
export const selectEntry = (
  name: string,
  chosen: IndexUseCase,
  baseIndex: IndexUseCase,
): DerivedSelectEntry =>
  chosen === baseIndex ? { name } : { name, index: chosen };

/** What a row shows: the entry's index when it sets one, else the base column's. */
export const chosenIndexFor = (
  entries: DerivedSelectEntry[],
  column: DerivedBaseColumn,
): IndexUseCase =>
  entries.find((entry) => entry.name === column.name)?.index ??
  column.baseIndex;

export const isColumnSelected = (
  entries: DerivedSelectEntry[],
  name: string,
): boolean => entries.some((entry) => entry.name === name);

/**
 * The selection rebuilt in base order after a tick.
 *
 * `select` is the ordered column list of the result, so the order comes from the
 * base schema rather than from the order the boxes were ticked. A name the base
 * no longer has is dropped, because the engine refuses it outright.
 */
export const rebuildSelection = (
  baseColumns: DerivedBaseColumn[],
  selectedNames: string[],
  current: DerivedSelectEntry[],
): DerivedSelectEntry[] => {
  const selected = new Set(selectedNames);
  return baseColumns
    .filter((column) => selected.has(column.name))
    .map((column) =>
      selectEntry(
        column.name,
        chosenIndexFor(current, column),
        column.baseIndex,
      ),
    );
};

/** The selection with one column's index use case changed. */
export const withIndexUseCase = (
  current: DerivedSelectEntry[],
  column: DerivedBaseColumn,
  chosen: IndexUseCase,
): DerivedSelectEntry[] =>
  current.map((entry) =>
    entry.name === column.name
      ? selectEntry(column.name, chosen, column.baseIndex)
      : entry,
  );
