import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { render, screen, within } from '@testing-library/react';
import { App } from 'antd';
import type { ReactNode } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ViewHuntDetail } from '.';

// The tabs, the action menu and the trigger reach their own APIs. What is under test is the stop notice.
vi.mock('@/Hunts/components/ViewHuntTabs', () => ({
  ViewHuntDetailTabs: () => null,
}));
vi.mock('./HuntDetailActionMenu', () => ({ HuntDetailActionMenu: () => null }));
vi.mock('./TriggerHunt', () => ({ TriggerHunt: () => null }));
vi.mock('@/core/hooks/useSetComponentHeight', () => ({
  useSetComponentHeight: () => ({ componentHeight: 600 }),
}));

const state = vi.hoisted(() => ({
  detail: undefined as unknown,
  listed: [] as Array<{ name: string; auto_disabled_at?: number | null }>,
}));
vi.mock('@/Hunts/contexts/ListHuntsContext', () => ({
  useListHuntsContext: () => ({
    selectedHuntName: 'windows_audit',
    data: { items: state.listed },
  }),
}));
vi.mock('@/Hunts/hooks/useFetchHuntDetail', () => ({
  useFetchHuntDetail: () => ({
    data: state.detail,
    isLoading: false,
    error: null,
  }),
}));

// The alert's Re-enable button reads the permissions the RBAC mocks serve.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  state.listed = [];
});
afterAll(() => server.close());

const { wrapper: Providers } = buildTestWrapper().withTheme().withReactQuery();
const wrapper = ({ children }: { children: ReactNode }) => (
  <Providers>
    <App>{children}</App>
  </Providers>
);

const hunt: THuntDetailResponse = {
  name: 'windows_audit',
  display_name: 'Windows audit',
  cron: '*/5 * * * *',
  log_buffer: 60,
  global_source_table_name: 'windows_audit',
  customers: ['acme'],
  rules: [{ rule_name: 'brute_force' }],
  enabled: true,
  auto_disabled_reason: '',
  error: '',
};

const NOTICE = /^Auto-disabled by the hunt runner on /;
const WAY_BACK = 'It fires nothing until it is re-enabled.';

describe('ViewHuntDetail runner stop', () => {
  it.each([
    {
      case: 'the detail carries the stop',
      detail: {
        ...hunt,
        auto_disabled_at: 1_763_300_000,
        auto_disabled_reason: 'resource_limit:241',
        error: '',
      },
      shown: /after hitting ClickHouse's memory limit repeatedly\.$/,
    },
    {
      case: 'the detail carries the stop with no reason',
      detail: { ...hunt, auto_disabled_at: 1_763_300_000 },
      shown: /after hitting a ClickHouse resource limit repeatedly\.$/,
    },
  ])('announces the stop when $case', async ({ detail, shown }) => {
    state.detail = detail;

    render(<ViewHuntDetail />, { wrapper });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(NOTICE)).toHaveTextContent(shown);
    expect(alert).not.toHaveTextContent(/resource_limit/);
    expect(screen.getByText(WAY_BACK)).toBeInTheDocument();
    // The button shows once the RBAC read has answered.
    expect(
      await within(alert).findByRole('button', { name: 'Re-enable Hunt' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Auto-disabled')).toBeInTheDocument();
  });

  it.each([
    { case: 'an enabled hunt', detail: hunt },
    {
      case: 'a hunt switched off by config',
      detail: { ...hunt, enabled: false },
    },
  ])('shows no stop notice for $case', ({ detail }) => {
    state.detail = { ...detail, auto_disabled_at: null };

    render(<ViewHuntDetail />, { wrapper });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument();
  });
});
