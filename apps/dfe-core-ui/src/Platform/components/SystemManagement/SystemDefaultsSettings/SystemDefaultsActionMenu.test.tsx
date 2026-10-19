import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { SystemDefaultsActionMenu } from './SystemDefaultsActionMenu';
import { ADMIN_MOCKED_RESPONSE } from './SystemDefaultSettings.mocks';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  http.get(API_CONFIG_MOCKS.system.defaultsDrift.mockedUrl, () =>
    HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      per_page: 10,
      total_pages: 0,
      next_page: null,
      prev_page: null,
    }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withTheme()
  .withWrapper(({ children }) => <App>{children}</App>);

const driftDrawer = () =>
  screen.queryByRole('dialog', { name: 'Identify Config Drift' });

describe('SystemDefaultsActionMenu', () => {
  test('opens config drift as soon as defaults change, without opening the menu', async () => {
    const { rerender } = render(
      <SystemDefaultsActionMenu
        onClick={{ onEditDefaultsClick: vi.fn() }}
        isConfigDriftOpen={false}
      />,
      { wrapper },
    );

    expect(driftDrawer()).not.toBeInTheDocument();

    rerender(
      <SystemDefaultsActionMenu
        onClick={{ onEditDefaultsClick: vi.fn() }}
        isConfigDriftOpen
      />,
    );

    expect(
      await screen.findByRole('dialog', { name: 'Identify Config Drift' }),
    ).toBeInTheDocument();
  });

  test('still opens config drift from the actions menu', async () => {
    const user = userEvent.setup();
    render(
      <SystemDefaultsActionMenu
        onClick={{ onEditDefaultsClick: vi.fn() }}
        isConfigDriftOpen={false}
      />,
      { wrapper },
    );

    await user.click(
      screen.getByRole('button', { name: 'System defaults actions' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Identify Config Drift' }),
    );

    expect(
      await screen.findByText(
        'No sources with config drift found in your environment.',
      ),
    ).toBeInTheDocument();
  });
});
