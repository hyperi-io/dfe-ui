import { describe, expect, it } from 'vitest';
import {
  previousTagPageStart,
  rowHasRoom,
  tagsThatFit,
} from './fitTags.helper';

const widths = [40, 40, 40, 40];

describe('tagsThatFit', () => {
  it('stops before the tag that would overflow', () => {
    expect(tagsThatFit(widths, 100, 8, 0)).toBe(2);
  });

  it('fits the remaining tags when they are the last page', () => {
    expect(tagsThatFit(widths, 100, 8, 2)).toBe(2);
  });

  it('keeps one tag when it is wider than the row', () => {
    expect(tagsThatFit([150, 40], 100, 8, 0)).toBe(1);
    expect(tagsThatFit([150, 40], 100, 8, 1)).toBe(1);
  });

  it('fits nothing when there is no width or no tags', () => {
    expect(tagsThatFit(widths, 0, 8, 0)).toBe(0);
    expect(tagsThatFit([], 100, 8, 0)).toBe(0);
    expect(tagsThatFit([0, 40], 100, 8, 0)).toBe(0);
  });
});

describe('previousTagPageStart', () => {
  it('walks back to the start of the previous full page', () => {
    expect(previousTagPageStart(widths, 100, 8, 2)).toBe(0);
    expect(previousTagPageStart([80, 20, 80, 20], 100, 8, 2)).toBe(1);
    expect(previousTagPageStart(widths, 100, 8, 0)).toBe(0);
  });
});

describe('rowHasRoom', () => {
  it('is true only when the fitted tags do not fill the row', () => {
    expect(rowHasRoom(widths, 100, 8, 0, 2)).toBe(true);
    expect(rowHasRoom([50, 50], 100, 0, 0, 2)).toBe(false);
    expect(rowHasRoom(widths, 100, 8, 0, 0)).toBe(false);
  });
});
