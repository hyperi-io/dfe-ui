import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/core/server/actions/getSetupStatus', () => ({
  getSetupStatus: vi.fn(),
}));

const SetupStepPage = (await import('@/app/(no-auth)/setup/[step]/page'))
  .default;

const redirect = vi.mocked((await import('next/navigation')).redirect);
const getSetupStatus = vi.mocked(
  (await import('@/core/server/actions/getSetupStatus')).getSetupStatus,
);

const status = (
  complete: boolean,
): Awaited<ReturnType<typeof getSetupStatus>> => ({
  initial_setup: {
    complete,
    current_step: complete ? null : 'first_user',
    steps: ['oidc_provider', 'organisations', 'first_user'],
    pending_steps: complete ? [] : ['first_user'],
    completed_steps: complete
      ? ['organisations', 'first_user']
      : ['organisations'],
    step_details: [],
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

const open = async (step: string) => {
  try {
    await SetupStepPage({ params: Promise.resolve({ step }) });
  } catch {
    // redirect() throws in Next.js - ignore
  }
  // The first call is the one that counts: the real redirect() stops there.
  return redirect.mock.calls[0]?.[0];
};

describe('SetupStepPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Creating the first user is what completes setup, so the screen after it
  // has to survive completion or the operator never sees it.
  test('Complete still renders once the last step has completed setup', async () => {
    getSetupStatus.mockResolvedValue(status(true));

    expect(await open('complete')).toBeUndefined();
  });

  test('every other step sends a configured deployment to the console', async () => {
    getSetupStatus.mockResolvedValue(status(true));

    expect(await open('configureUser')).toBe('/');
  });

  test('a step renders while setup is outstanding', async () => {
    getSetupStatus.mockResolvedValue(status(false));

    expect(await open('configureUser')).toBeUndefined();
  });
});
