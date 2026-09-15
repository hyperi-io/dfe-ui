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

const retireButton = () =>
  screen.findByRole('button', { name: /Retire the bootstrap admin/ });

describe('CompleteStep', () => {
  test('offers the retirement only when the engine says it would accept it', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({ retire_admin_available: false }),
      }),
    );

    render(<CompleteStep goPrevious={vi.fn()} />, { wrapper });

    expect(await screen.findByText('Complete')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Retire the bootstrap admin/ }),
    ).not.toBeInTheDocument();
  });

  test('names the deployment own admin account in the offer', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({
          retire_admin_available: true,
          admin_username: 'installer',
        }),
      }),
    );

    render(<CompleteStep goPrevious={vi.fn()} />, { wrapper });

    expect(await retireButton()).toBeInTheDocument();
    expect(await screen.findByText('installer')).toBeInTheDocument();
  });

  test('retires the admin and reports the account is retired', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({ retire_admin_available: true }),
      }),
      API_CONFIG_MOCKS.auth.retireAdmin.post.success({
        mockedResponse: status({
          admin_retired: true,
          retire_admin_available: false,
        }),
      }),
    );

    render(<CompleteStep goPrevious={vi.fn()} />, { wrapper });
    await userEvent.click(await retireButton());

    await waitFor(() => {
      expect(
        screen.getByText('The admin account is retired'),
      ).toBeInTheDocument();
    });
  });

  test('surfaces a refusal instead of claiming the admin is retired', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.setupStatus.get.success({
        mockedResponse: status({ retire_admin_available: true }),
      }),
      API_CONFIG_MOCKS.auth.retireAdmin.post.error(),
    );

    render(<CompleteStep goPrevious={vi.fn()} />, { wrapper });
    await userEvent.click(await retireButton());

    await waitFor(() => {
      expect(
        screen.getByText('The engine would not retire the admin'),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByText('The admin account is retired'),
    ).not.toBeInTheDocument();
  });
});
