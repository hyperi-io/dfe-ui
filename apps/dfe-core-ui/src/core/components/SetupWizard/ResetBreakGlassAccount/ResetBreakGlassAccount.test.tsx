import { TBreakGlass } from '@/core/hooks/useFetchSetupStatus/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ResetBreakGlassAccount } from '.';
import { server } from './ResetBreakGlassAccount.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

const renderStep = (
  goNext = vi.fn(),
  breakGlass: TBreakGlass = mergedBreakGlass,
) => {
  const testWrapper = buildTestWrapper().withReactQuery();
  render(
    <ResetBreakGlassAccount
      goNext={goNext}
      goPrevious={vi.fn()}
      breakGlass={breakGlass}
    />,
    { wrapper: testWrapper.wrapper },
  );
  return { testWrapper, goNext };
};

describe('ResetBreakGlassAccount', () => {
  it('offers the rotation form without advancing on its own', async () => {
    const { goNext } = renderStep();

    expect(await screen.findByLabelText('New Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset password/i }),
    ).toBeInTheDocument();
    expect(goNext).not.toHaveBeenCalled();
  });

  it('advances on skip, keeping the password the deployment minted', async () => {
    const user = userEvent.setup();
    const { goNext } = renderStep();

    await user.click(screen.getByRole('button', { name: /skip for now/i }));

    expect(goNext).toHaveBeenCalled();
  });

  it('resets the breakglass account, not the everyday admin', async () => {
    // An admin reset is reverted by the next boot, which reconciles that
    // password from the deployment's config; a breakglass reset is durable.
    const user = userEvent.setup();
    let resetPath = '';
    server.use(
      http.post(
        '/api/v1/auth/accounts/:username/reset-password',
        ({ params }) => {
          resetPath = String(params.username);
          return HttpResponse.json({
            message: 'password reset',
            git: {
              enabled: false,
              committed: false,
              auto_merge: false,
              merged: false,
            },
          });
        },
      ),
    );
    renderStep();

    await user.type(
      await screen.findByLabelText('New Password'),
      'a-minted-password',
    );
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(resetPath).toBe('breakglass');
    });
  });

  it('reports the reset and enables Next once it succeeds', async () => {
    const user = userEvent.setup();
    const { goNext } = renderStep();

    await user.type(
      await screen.findByLabelText('New Password'),
      'a-minted-password',
    );
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(
      await screen.findByText(/breakglass account password has been reset/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(goNext).toHaveBeenCalled();
  });

  it('does not claim the reset survives a restart', async () => {
    // breakglass.seed() reconciles the account from the committed hash on every
    // boot, so the durable path is the deployment variable, not this form.
    const user = userEvent.setup();
    renderStep();

    await user.type(
      await screen.findByLabelText('New Password'),
      'a-minted-password',
    );
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(
      await screen.findByText(/until the next engine restart/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/DFE_AUTH_BREAKGLASS_PASSWORD/),
    ).toBeInTheDocument();
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
