import { LoginScene } from '@/core/scenes/LoginScene';
import { render, screen } from '@testing-library/react';
import { isValidElement } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/core/server/actions/getSetupStatus', async () => {
  const actual = await vi.importActual<
    typeof import('@/core/server/actions/getSetupStatus')
  >('@/core/server/actions/getSetupStatus');
  return {
    ...actual,
    getSetupStatus: vi.fn(),
  };
});

const Login = (await import('@/app/(no-auth)/login/page')).default;

const getServerSession = vi.mocked(
  (await import('next-auth')).getServerSession,
);
const redirect = vi.mocked((await import('next/navigation')).redirect);
const { getSetupStatus, MissingApiUrlError, EngineUnreachableError } =
  await import('@/core/server/actions/getSetupStatus');
const getSetupStatusMock = vi.mocked(getSetupStatus);

const setupComplete: Awaited<ReturnType<typeof getSetupStatusMock>> = {
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
  deploy_kind: 'local',
  credential_fetch_command: '',
  default_engine: 'MergeTree',
  default_ttl_days: 90,
  admin_username: 'admin',
  admin_retired: false,
  retire_admin_available: false,
};

const page = () => Login({ searchParams: Promise.resolve({}) });

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(null);
    getSetupStatusMock.mockResolvedValue(setupComplete);
  });

  test('serves the sign-in scene when the engine answers', async () => {
    const element = await page();

    expect(isValidElement(element)).toBe(true);
    expect(element).toHaveProperty('type', LoginScene);
    expect(redirect).not.toHaveBeenCalled();
  });

  test('names a missing engine URL instead of throwing', async () => {
    getSetupStatusMock.mockRejectedValue(new MissingApiUrlError());

    const element = await page();
    render(element);

    expect(
      screen.getByRole('heading', { name: 'The engine URL is not configured' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Neither INTERNAL_API_URL nor NEXT_PUBLIC_API_URL is set.',
      ),
    ).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  test('names a missing engine URL for a visitor who still holds a session cookie', async () => {
    getSetupStatusMock.mockRejectedValue(new MissingApiUrlError());
    getServerSession.mockResolvedValue({
      user: { name: 'admin', accessToken: 'engine-jwt' },
      expires: '2099-01-01',
    });

    const element = await page();
    render(element);

    expect(
      screen.getByRole('heading', { name: 'The engine URL is not configured' }),
    ).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  test.each([
    ['an unreachable engine', new EngineUnreachableError()],
    ['any other failure', new Error('Failed to fetch setup status (500)')],
  ])(
    'still throws for %s, which is not a configuration fault',
    async (_name, failure) => {
      getSetupStatusMock.mockRejectedValue(failure);

      await expect(page()).rejects.toBe(failure);
    },
  );
});
