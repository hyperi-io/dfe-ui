import { QUERY_KEY_SETUP_STATUS } from '@/core/hooks/useFetchSetupStatus';
import {
  TBreakGlass,
  TFetchSetupStatusResponse,
} from '@/core/hooks/useFetchSetupStatus/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetBreakGlassAccount } from '.';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const mergedBreakGlass: TBreakGlass = {
  enabled: true,
  auto_merge: false,
  committed: false,
  merged: true,
  pending: null,
};

const pendingBreakGlass: TBreakGlass = {
  enabled: true,
  auto_merge: false,
  committed: true,
  merged: false,
  pending: {
    pr_url: 'https://example.com/pr/1',
    command: 'git merge origin/break-glass',
    branch: 'break-glass',
  },
};

const setupStatusWith = (
  completedSteps: string[],
): TFetchSetupStatusResponse => ({
  initial_setup: {
    complete: completedSteps.includes('admin_password'),
    current_step: 'admin_password',
    steps: ['organisations', 'first_user', 'admin_password'],
    pending_steps: completedSteps.includes('admin_password')
      ? []
      : ['admin_password'],
    completed_steps: completedSteps,
    step_details: [],
  },
  oidc_providers: [],
  organisations: [],
  break_glass: mergedBreakGlass,
});

const renderStep = (
  goNext = vi.fn(),
  breakGlass: TBreakGlass = mergedBreakGlass,
) => {
  const testWrapper = buildTestWrapper().withReactQuery();
  render(
    <ResetBreakGlassAccount
      isAdminReset={false}
      goNext={goNext}
      goPrevious={vi.fn()}
      breakGlass={breakGlass}
    />,
    { wrapper: testWrapper.wrapper },
  );
  return { testWrapper, goNext };
};

describe('ResetBreakGlassAccount', () => {
  it('keeps the rotation form when merged=true but admin_password is not complete', async () => {
    const { testWrapper, goNext } = renderStep();

    // Account durability merges the seeded account before any rotation, so a
    // gitops deploy reports merged=true while the step is still pending.
    act(() => {
      testWrapper.queryClient?.setQueryData(
        QUERY_KEY_SETUP_STATUS(),
        setupStatusWith(['organisations', 'first_user']),
      );
    });

    expect(await screen.findByLabelText('New Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset password/i }),
    ).toBeInTheDocument();
    expect(goNext).not.toHaveBeenCalled();
  });

  it('does not advance on a cold render with only the server break_glass prop', async () => {
    const { goNext } = renderStep();

    expect(await screen.findByLabelText('New Password')).toBeInTheDocument();
    expect(goNext).not.toHaveBeenCalled();
  });

  it('advances once the engine reports admin_password complete', async () => {
    const { testWrapper, goNext } = renderStep();

    act(() => {
      testWrapper.queryClient?.setQueryData(
        QUERY_KEY_SETUP_STATUS(),
        setupStatusWith(['organisations', 'first_user', 'admin_password']),
      );
    });

    await waitFor(() => {
      expect(goNext).toHaveBeenCalled();
    });
  });

  describe('pending merge retry countdown', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('counts down each second and restarts after the retry interval', () => {
      renderStep(vi.fn(), pendingBreakGlass);

      expect(screen.getByText(/Retrying in 10 seconds/)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Retrying in 9 seconds/)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.getByText(/Retrying in 5 seconds/)).toBeInTheDocument();
    });
  });
});
