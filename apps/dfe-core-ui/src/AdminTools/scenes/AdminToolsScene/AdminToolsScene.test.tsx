import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AdminToolsScene } from '.';
import { server } from './AdminToolsScene.mocks';

const meWithPermissions = (permissions: string[]) => ({
  ...ADMIN_MOCKED_RESPONSE,
  permissions,
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  server.events.removeAllListeners();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('AdminToolsScene', () => {
  it('lists the admin UIs for a role holding the admin links action', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: meWithPermissions(['deployment:admin_links:read']),
      }),
    );

    render(<AdminToolsScene />, { wrapper });

    expect(
      await screen.findByRole('link', { name: /Argo CD/ }),
    ).toBeInTheDocument();
  });

  it('shows a viewer the not-permitted view and never asks the engine', async () => {
    const asked: string[] = [];
    server.events.on('request:start', ({ request }) => {
      asked.push(new URL(request.url).pathname);
    });
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: meWithPermissions(['deployment:read', 'service:read']),
      }),
    );

    render(<AdminToolsScene />, { wrapper });

    expect(
      await screen.findByText('You do not have sufficient permissions'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(asked).not.toContain('/api/v1/deployment/admin-links');
  });
});
