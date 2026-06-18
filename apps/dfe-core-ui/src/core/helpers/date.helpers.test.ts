import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  formatDateToString,
  formatDateXAgo,
  parseValidDate,
} from './date.helpers';

describe('ViewOrganisationDrawer.helpers', () => {
  describe('.parseValidDate', () => {
    test('returns null for empty or whitespace', () => {
      expect(parseValidDate('')).toBeNull();
      expect(parseValidDate('   ')).toBeNull();
      expect(parseValidDate(undefined)).toBeNull();
      expect(parseValidDate(null)).toBeNull();
    });

    test('returns null for invalid date strings', () => {
      expect(parseValidDate('not-a-date')).toBeNull();
    });

    test('returns dayjs instance for valid ISO dates', () => {
      expect(parseValidDate('2021-01-01T00:00:00Z')?.isValid()).toBe(true);
    });
  });

  describe('.formatDateToString', () => {
    test('should format valid UTC date to DD MMM YYYY, HH:mm', () => {
      expect(formatDateToString('2021-01-01T00:00:00Z')).toBe(
        '01 Jan 2021, 00:00',
      );
    });

    test('should return N/A for empty date', () => {
      expect(formatDateToString('')).toBe('N/A');
    });

    test('should return Invalid date for unparseable input', () => {
      expect(formatDateToString('not-a-date')).toBe('Invalid date');
    });
  });

  describe('.formatDateXAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2021-01-01T00:01:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should format recent valid date as relative time', () => {
      expect(formatDateXAgo('2021-01-01T00:00:00Z')).toBe('1 minutes ago');
    });

    test('should return just now when timestamp matches now', () => {
      expect(formatDateXAgo('2021-01-01T00:01:00Z')).toBe('just now');
    });

    test('should return N/A for empty date', () => {
      expect(formatDateXAgo('')).toBe('N/A');
    });

    test('should return Invalid date for unparseable input', () => {
      expect(formatDateXAgo('not-a-date')).toBe('Invalid date');
    });
  });
});
