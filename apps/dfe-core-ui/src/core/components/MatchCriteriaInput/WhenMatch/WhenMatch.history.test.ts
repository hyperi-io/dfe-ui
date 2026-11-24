import { describe, expect, it } from 'vitest';
import {
  matchHistory,
  recordMatch,
  redoMatch,
  undoMatch,
} from './WhenMatch.history';

const field = (name: string) => ({ field: name, operator: 'equals' as const });

describe('match history', () => {
  it('records a change and clears anything that had been redone', () => {
    const edited = recordMatch(matchHistory(null), field('host'));
    const undone = undoMatch(edited);
    const replaced = recordMatch(undone, field('user'));

    expect(replaced.present).toEqual(field('user'));
    expect(replaced.future).toEqual([]);
    expect(undoMatch(replaced).present).toBeNull();
  });

  it('ignores a snapshot that matches the current one', () => {
    const current = recordMatch(matchHistory(null), field('host'));

    expect(recordMatch(current, field('host'))).toBe(current);
  });

  it('undoes and redoes', () => {
    const edited = recordMatch(matchHistory(null), field('host'));
    const undone = undoMatch(edited);
    const redone = redoMatch(undone);

    expect(undone.present).toBeNull();
    expect(redone.present).toEqual(field('host'));
    expect(undoMatch(matchHistory(null))).toEqual(matchHistory(null));
    expect(redoMatch(edited)).toBe(edited);
  });
});
