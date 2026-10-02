import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TDefaultsDriftSourceItem } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { ApplyDefaultsContent } from './ApplyDefaultsContent';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

const driftSource = (
  source: string,
  core: boolean,
): TDefaultsDriftSourceItem => ({
  source,
  core,
  drifted: ['ttl_days'],
  ttl_days: { stored: core ? '30' : '14', default: '90' },
  common_header_type: { stored: 'string', default: 'string' },
  common_header_version: { stored: 'string', default: 'string' },
  engine: { stored: 'string', default: 'string' },
});

const onApply = vi.fn();

const server = setupServer(
  http.get(API_CONFIG_MOCKS.system.defaultsDrift.mockedUrl, () =>
    HttpResponse.json({
      items: [
        driftSource('core_source', true),
        driftSource('custom_source', false),
      ],
      total: 2,
      page: 1,
      per_page: 10,
      total_pages: 1,
      next_page: null,
      prev_page: null,
    }),
  ),
  http.post(
    API_CONFIG_MOCKS.system.applyDefaults.mockedUrl,
    async ({ request }) => {
      onApply(await request.json());
      return HttpResponse.json({
        updated: ['custom_source'],
        unchanged: [],
      });
    },
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => onApply.mockReset());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withTheme()
  .withWrapper(({ children }) => <App>{children}</App>);

describe('ApplyDefaultsContent', () => {
  test('applies defaults to the selected sources and skips engine-owned ones', async () => {
    const user = userEvent.setup();
    render(<ApplyDefaultsContent />, { wrapper });

    const applyButton = await screen.findByRole('button', {
      name: 'Apply Defaults',
    });
    expect(applyButton).toBeDisabled();
    expect(screen.getByText('0 selected')).toBeInTheDocument();

    const coreRow = await screen.findByRole('row', { name: /core_source/ });
    expect(within(coreRow).getByRole('checkbox')).toBeDisabled();

    const customRow = screen.getByRole('row', { name: /custom_source/ });
    await user.click(within(customRow).getByRole('checkbox'));

    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(applyButton).toBeEnabled();

    await user.click(applyButton);

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith({ sources: ['custom_source'] });
    });
    await waitFor(() => {
      expect(screen.getByText('0 selected')).toBeInTheDocument();
    });
    expect(applyButton).toBeDisabled();
  });
});
