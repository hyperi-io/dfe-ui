import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NOW_TICK_MS, useNow } from '.';

const START = new Date('2026-11-26T12:00:00Z');

const setVisibility = (state: 'visible' | 'hidden') => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(START);
  setVisibility('visible');
});
afterEach(() => {
  vi.useRealTimers();
});

describe('useNow', () => {
  it('reads the clock again every tick while the tab is visible', () => {
    const { result } = renderHook(() => useNow());
    expect(result.current).toBe(START.getTime());

    act(() => {
      vi.advanceTimersByTime(NOW_TICK_MS);
    });
    expect(result.current).toBe(START.getTime() + NOW_TICK_MS);

    act(() => {
      vi.advanceTimersByTime(NOW_TICK_MS);
    });
    expect(result.current).toBe(START.getTime() + 2 * NOW_TICK_MS);
  });

  it('stops ticking while the tab is hidden and catches up when it shows', () => {
    const { result } = renderHook(() => useNow());

    act(() => setVisibility('hidden'));
    act(() => {
      vi.advanceTimersByTime(5 * NOW_TICK_MS);
    });
    expect(result.current).toBe(START.getTime());

    act(() => setVisibility('visible'));
    expect(result.current).toBe(START.getTime() + 5 * NOW_TICK_MS);
  });

  it('leaves no timer behind once unmounted', () => {
    const { unmount } = renderHook(() => useNow());
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
