import { beforeEach, describe, expect, test, vi } from 'vitest';

const { navigateWithReload } = vi.hoisted(() => ({
  navigateWithReload: vi.fn(),
}));

vi.mock('@/core/utils/navigation', () => ({ navigateWithReload }));

const { handlePasswordChangeRequired } = await import(
  './handlePasswordChangeRequired'
);

describe('handlePasswordChangeRequired', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/sources');
  });

  test('sends the browser to the change screen', () => {
    handlePasswordChangeRequired();

    expect(navigateWithReload).toHaveBeenCalledWith('/change-password');
  });

  test('stays put when the change screen is already open', () => {
    window.history.pushState({}, '', '/change-password');

    handlePasswordChangeRequired();

    expect(navigateWithReload).not.toHaveBeenCalled();
  });
});
