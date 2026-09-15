import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Sidebar } from './index';
import { server } from './SuiteVersion/SuiteVersion.mocks';

// 'bypass', not 'error': Sidebar also mounts the RBAC-gated SidebarMenu, whose
// own network needs are covered by SidebarMenu.test.tsx, not this file.
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('Sidebar footer version', () => {
  // The bottom-left is the one place the deployed suite version lives now; the
  // full VersionFooter/SuiteVersion behaviour is covered in SuiteVersion.test.tsx.
  it('shows the suite version from the API when expanded', async () => {
    server.use(
      API_CONFIG_MOCKS.system.version.get.success({
        mockedResponse: {
          stack: '2.2.0-rc.13',
          engine: '1.19.12',
          ui: null,
          source: 'deploy-repo',
          apps: {},
          python_version: '3.12.12',
          apps: {
            'dfe-core-ui': '1.0.0',
            'dfe-core-api': '1.0.0',
            'dfe-core-db': '1.0.0',
            'dfe-core-auth': '1.0.0',
            'dfe-core-storage': '1.0.0',
            'dfe-core-messaging': '1.0.0',
          },
        },
      }),
    );

    render(<Sidebar />, { wrapper });

    expect(await screen.findByText('2.2.0-rc.13')).toBeInTheDocument();
  });
});
