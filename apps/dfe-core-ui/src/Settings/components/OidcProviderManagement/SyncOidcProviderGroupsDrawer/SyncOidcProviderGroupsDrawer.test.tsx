import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TSyncOidcProviderGroupsResponse } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { SyncOidcProviderGroupsDrawer } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const NOT_CONFIGURED_MESSAGE =
  'The directory credential is not configured, so no groups were synced; configure it on the provider and sync again';

const sync = async (mockedResponse: TSyncOidcProviderGroupsResponse) => {
  server.use(
    API_CONFIG_MOCKS.oidcProviders.syncGroups.post.success({
      mockedResponse,
      name: 'okta',
    }),
  );
  render(<SyncOidcProviderGroupsDrawer oidcProviderName="okta" />, {
    wrapper,
  });
  await userEvent.click(
    await screen.findByRole('button', { name: 'Sync OIDC Provider Groups' }),
  );
};

describe('SyncOidcProviderGroupsDrawer', () => {
  test('says why a sync did nothing', async () => {
    await sync({
      created: 0,
      updated: 0,
      total: 0,
      groups_skipped: 0,
      error: null,
      skipped: NOT_CONFIGURED_MESSAGE,
    });

    expect(await screen.findByText('Sync skipped')).toBeVisible();
    expect(screen.getByText(NOT_CONFIGURED_MESSAGE)).toBeVisible();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  test('shows the counts and no skipped notice for a sync that ran', async () => {
    await sync({
      created: 3,
      updated: 2,
      total: 5,
      groups_skipped: 0,
      error: null,
      skipped: null,
    });

    expect(await screen.findByText('Groups Created')).toBeVisible();
    expect(screen.getByText('5')).toBeVisible();
    expect(screen.queryByText('Sync skipped')).not.toBeInTheDocument();
  });

  test('shows the engine error when the directory refused the sync', async () => {
    const message =
      'The directory API could not use the configured credential: check it is current and valid; the engine log has the reason';
    await sync({
      created: 0,
      updated: 0,
      total: 0,
      groups_skipped: 0,
      error: message,
      skipped: null,
    });

    expect(await screen.findByText('Error')).toBeVisible();
    expect(screen.getByText(message)).toBeVisible();
    expect(screen.queryByText('Sync skipped')).not.toBeInTheDocument();
  });
});
