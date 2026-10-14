import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { CompleteStep } from '.';
import { server } from './CompleteStep.mocks';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({ push: vi.fn() }),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const status = (
  overrides: Partial<TFetchSetupStatusResponse>,
): TFetchSetupStatusResponse => ({
  initial_setup: {
    complete: true,
    current_step: null,
    steps: [],
    pending_steps: [],
    completed_steps: [],
    step_details: [],
  },
  oidc_providers: [],
  organisations: [],
  default_credentials: false,
  deploy_kind: 'docker',
  credential_fetch_command: 'make creds',
  default_engine: 'MergeTree',
  default_ttl_days: 90,
  admin_username: 'admin',
  admin_retired: false,
  retire_admin_available: false,
  ...overrides,
});

const BACKSTOP = { timeout: 15_000 };

describe('CompleteStep', () => {
  test('keeps the admin: never offers to retire it, even when the engine would accept it', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({ retire_admin_available: true }),
      }),
    );

    render(<CompleteStep goPrevious={vi.fn()} />, { wrapper });

    expect(
      await screen.findByText(/stays as your local way in/, {}, BACKSTOP),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retire/ })).toBeNull();
    expect(screen.queryByText(/retired/i)).toBeNull();
  });

  test('names the deployment own admin account and where to reset it', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({ admin_username: 'installer' }),
      }),
    );

    render(<CompleteStep goPrevious={vi.fn()} />, { wrapper });

    expect(
      await screen.findByText('installer', {}, BACKSTOP),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Account Management, Security accounts/),
    ).toBeInTheDocument();
  });

  test('reports an admin an operator has already retired', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({ admin_retired: true }),
      }),
    );

    render(<CompleteStep goPrevious={vi.fn()} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText('The admin account is retired'),
      ).toBeInTheDocument();
    }, BACKSTOP);
    expect(screen.queryByText(/stays as your local way in/)).toBeNull();
  });

  test('offers Back while there is a step to go back to', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({}),
      }),
    );
    const goPrevious = vi.fn();

    render(<CompleteStep goPrevious={goPrevious} />, { wrapper });
    await userEvent.click(
      await screen.findByRole('button', { name: /Back/ }, BACKSTOP),
    );

    expect(goPrevious).toHaveBeenCalledTimes(1);
  });

  test('offers no Back once the steps behind it are closed', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({}),
      }),
    );

    render(<CompleteStep />, { wrapper });

    expect(
      await screen.findByRole('button', { name: /Get started/ }, BACKSTOP),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Back/ }),
    ).not.toBeInTheDocument();
  });
});
