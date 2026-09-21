import {
  baseColumnFrom,
  chosenIndexFor,
  DerivedBaseColumn,
  rebuildSelection,
  selectEntry,
  withIndexUseCase,
} from '@/Schemas/components/DerivedSchemaFieldPicker/DerivedSchemaFieldPicker.helpers';
import { describe, expect, it } from 'vitest';

const baseColumns: DerivedBaseColumn[] = [
  { name: 'timestamp', baseIndex: 'range' },
  { name: 'host_name', baseIndex: 'dimension' },
  { name: 'user_name', baseIndex: 'none' },
  { name: 'message', baseIndex: 'word_search' },
];

describe('baseColumnFrom', () => {
  it('reads the base column index through the rename', () => {
    expect(baseColumnFrom({ name: 'message', use_case: 'fulltext' })).toEqual({
      name: 'message',
      baseIndex: 'word_search',
    });
  });

  it('gives a column with no index use case none', () => {
    expect(baseColumnFrom({ name: 'log_offset' })).toEqual({
      name: 'log_offset',
      baseIndex: 'none',
    });
  });
});

describe('selectEntry', () => {
  it('omits index when the choice matches the base', () => {
    expect(selectEntry('message', 'word_search', 'word_search')).toEqual({
      name: 'message',
    });
  });

  it('writes index when the choice differs from the base', () => {
    expect(selectEntry('user_name', 'exact_match', 'none')).toEqual({
      name: 'user_name',
      index: 'exact_match',
    });
  });

  it('writes none when the base had an index and the user dropped it', () => {
    expect(selectEntry('host_name', 'none', 'dimension')).toEqual({
      name: 'host_name',
      index: 'none',
    });
  });
});

describe('rebuildSelection', () => {
  it('orders the selection by the base, not by the order ticked', () => {
    expect(
      rebuildSelection(baseColumns, ['message', 'timestamp', 'host_name'], []),
    ).toEqual([
      { name: 'timestamp' },
      { name: 'host_name' },
      { name: 'message' },
    ]);
  });

  it('keeps an index a still-selected column already had', () => {
    const current = [{ name: 'user_name', index: 'exact_match' as const }];
    expect(
      rebuildSelection(baseColumns, ['timestamp', 'user_name'], current),
    ).toEqual([
      { name: 'timestamp' },
      { name: 'user_name', index: 'exact_match' },
    ]);
  });

  it('drops a name the base no longer has', () => {
    const current = [{ name: 'gone', index: 'range' as const }];
    expect(
      rebuildSelection(baseColumns, ['gone', 'timestamp'], current),
    ).toEqual([{ name: 'timestamp' }]);
  });
});

describe('chosenIndexFor', () => {
  it('falls back to the base column when the entry sets no index', () => {
    expect(
      chosenIndexFor([{ name: 'message' }], {
        name: 'message',
        baseIndex: 'word_search',
      }),
    ).toBe('word_search');
  });

  it('uses the entry index when it sets one', () => {
    expect(
      chosenIndexFor([{ name: 'message', index: 'substring_search' }], {
        name: 'message',
        baseIndex: 'word_search',
      }),
    ).toBe('substring_search');
  });
});

describe('withIndexUseCase', () => {
  it('changes one column and leaves the rest alone', () => {
    const current = [{ name: 'timestamp' }, { name: 'message' }];
    expect(
      withIndexUseCase(
        current,
        { name: 'message', baseIndex: 'word_search' },
        'none',
      ),
    ).toEqual([{ name: 'timestamp' }, { name: 'message', index: 'none' }]);
  });

  it('drops the index again when the choice returns to the base', () => {
    const current = [{ name: 'message', index: 'none' as const }];
    expect(
      withIndexUseCase(
        current,
        { name: 'message', baseIndex: 'word_search' },
        'word_search',
      ),
    ).toEqual([{ name: 'message' }]);
  });
});
