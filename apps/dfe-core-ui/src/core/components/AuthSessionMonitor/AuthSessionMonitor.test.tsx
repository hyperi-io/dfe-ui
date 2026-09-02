import { isValidElement, Suspense, type ReactElement } from 'react';
import { describe, expect, test } from 'vitest';
import { AuthSessionMonitor } from '.';

describe('AuthSessionMonitor', () => {
  test('wraps useSearchParams in Suspense so Next can prerender /_not-found', () => {
    const tree = AuthSessionMonitor();
    expect(isValidElement(tree)).toBe(true);
    expect((tree as ReactElement).type).toBe(Suspense);
  });
});
