import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/core/server/actions/getSetupStatus', () => ({
  getSetupStatus: vi.fn(),
}));

const Setup = (await import('@/app/(no-auth)/setup/page')).default;

const redirect = vi.mocked((await import('next/navigation')).redirect);
const getSetupStatus = vi.mocked(
  (await import('@/core/server/actions/getSetupStatus')).getSetupStatus,
);

const statusWith = (
  initialSetup: Partial<
    Awaited<ReturnType<typeof getSetupStatus>>['initial_setup']
  >,
): Awaited<ReturnType<typeof getSetupStatus>> => ({
  initial_setup: {
    complete: false,
    current_step: null,
    steps: ['oidc_provider', 'organisations', 'first_user'],
    pending_steps: [],
    completed_steps: [],
    step_details: [],
    ...initialSetup,
  },
  oidc_providers: [],
  organisations: [],
  default_credentials: false,
  deploy_kind: 'docker',
  credential_fetch_command: '',
  default_engine: 'MergeTree',
  default_ttl_days: 90,
  admin_username: 'admin',
  admin_retired: false,
  retire_admin_available: false,
});

const landing = async () => {
  try {
    await Setup();
  } catch {
    // redirect() throws in Next.js - ignore
  }
  // The first call is the one that counts: the real redirect() stops there.
  return redirect.mock.calls[0]?.[0];
};

describe('Setup (wizard entry)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('a fresh deployment lands on welcome, not its first pending step', async () => {
    getSetupStatus.mockResolvedValue(
      statusWith({
        current_step: 'organisations',
        pending_steps: ['organisations', 'first_user'],
      }),
    );

    expect(await landing()).toBe('/setup/welcome');
  });

  test('a half-configured deployment still lands on welcome', async () => {
    getSetupStatus.mockResolvedValue(
      statusWith({
        current_step: 'first_user',
        pending_steps: ['first_user'],
        completed_steps: ['organisations'],
      }),
    );

    expect(await landing()).toBe('/setup/welcome');
  });

  test('a configured deployment leaves the wizard for the console', async () => {
    getSetupStatus.mockResolvedValue(
      statusWith({
        complete: true,
        completed_steps: ['organisations', 'first_user'],
      }),
    );

    expect(await landing()).toBe('/');
  });
});
