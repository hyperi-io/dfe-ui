import { REAUTH_MESSAGE } from '@/core/hooks/useReauth';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReauthReturn } from '.';

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, 'opener', { configurable: true, value: null });
  window.history.replaceState(null, '', '/');
});

const landWith = (fragment: string) => {
  window.history.replaceState(null, '', `/login/reauth#${fragment}`);
  const postMessage = vi.fn();
  Object.defineProperty(window, 'opener', {
    configurable: true,
    value: { postMessage },
  });
  const close = vi.spyOn(window, 'close').mockImplementation(() => undefined);
  render(<ReauthReturn />);
  return { close, postMessage };
};

describe('ReauthReturn', () => {
  it.each([
    [
      'reauth_grant=g1&expires_in=600',
      { error: undefined, grant: 'g1', type: REAUTH_MESSAGE },
    ],
    [
      'error=reauth_not_fresh&provider=stub',
      { error: 'reauth_not_fresh', grant: undefined, type: REAUTH_MESSAGE },
    ],
  ])(
    'hands the answer in #%s to its opener on this origin only, then closes',
    (fragment, expected) => {
      const { close, postMessage } = landWith(fragment);

      expect(postMessage).toHaveBeenCalledTimes(1);
      expect(postMessage).toHaveBeenCalledWith(
        expected,
        window.location.origin,
      );
      expect(close).toHaveBeenCalled();
    },
  );

  it('clears the grant from the address bar', () => {
    landWith('reauth_grant=g1&expires_in=600');

    expect(window.location.hash).toBe('');
  });
});
