import { TMatchFormNode } from './WhenMatch.types';

export type MatchSnapshot = TMatchFormNode | null;

export type MatchHistory = {
  past: MatchSnapshot[];
  present: MatchSnapshot;
  future: MatchSnapshot[];
};

const HISTORY_LIMIT = 100;

const sameMatch = (left: MatchSnapshot, right: MatchSnapshot) =>
  JSON.stringify(left) === JSON.stringify(right);

export const matchHistory = (present: MatchSnapshot): MatchHistory => ({
  past: [],
  present,
  future: [],
});

export const recordMatch = (
  history: MatchHistory,
  present: MatchSnapshot,
): MatchHistory => {
  if (sameMatch(history.present, present)) return history;
  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present,
    future: [],
  };
};

export const undoMatch = (history: MatchHistory): MatchHistory => {
  if (history.past.length === 0) return history;
  return {
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1],
    future: [history.present, ...history.future],
  };
};

export const redoMatch = (history: MatchHistory): MatchHistory => {
  if (history.future.length === 0) return history;
  const [present, ...future] = history.future;
  return {
    past: [...history.past, history.present],
    present,
    future,
  };
};
