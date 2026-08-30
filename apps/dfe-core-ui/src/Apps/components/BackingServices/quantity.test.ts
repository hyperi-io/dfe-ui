import { describe, expect, it } from 'vitest';
import { isMemoryDecrease, parseMemoryQuantity } from './quantity';

describe('parseMemoryQuantity', () => {
  it('reads binary and decimal suffixes', () => {
    expect(parseMemoryQuantity('1Ki')).toBe(1024);
    expect(parseMemoryQuantity('2Gi')).toBe(2 * 1024 ** 3);
    expect(parseMemoryQuantity('1M')).toBe(1000 ** 2);
  });

  it('reads a bare byte count', () => {
    expect(parseMemoryQuantity('1048576')).toBe(1048576);
    expect(parseMemoryQuantity(2048)).toBe(2048);
  });

  it('returns null rather than guessing at something it cannot read', () => {
    expect(parseMemoryQuantity('lots')).toBeNull();
    expect(parseMemoryQuantity('2Gib')).toBeNull();
    expect(parseMemoryQuantity(null)).toBeNull();
    expect(parseMemoryQuantity(undefined)).toBeNull();
  });
});

describe('isMemoryDecrease', () => {
  it('compares across units', () => {
    expect(isMemoryDecrease('2Gi', '512Mi')).toBe(true);
    expect(isMemoryDecrease('512Mi', '2Gi')).toBe(false);
  });

  it('is not a decrease when the value is unchanged', () => {
    expect(isMemoryDecrease('2Gi', '2Gi')).toBe(false);
  });

  it('is unknown, not false, when either side is unreadable', () => {
    expect(isMemoryDecrease(null, '512Mi')).toBeNull();
    expect(isMemoryDecrease('2Gi', 'small')).toBeNull();
  });
});
