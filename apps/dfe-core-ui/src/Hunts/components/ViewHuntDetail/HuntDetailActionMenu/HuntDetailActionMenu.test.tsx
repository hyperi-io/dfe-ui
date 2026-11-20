import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { HuntStateTag } from '@/Hunts/components/HuntStateTag';
import { useFetchHuntDetail } from '@/Hunts/hooks/useFetchHuntDetail';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { useHuntRunState } from '@/Hunts/hooks/useHuntRunState';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { delay, http, HttpResponse } from 'msw';
import type { ReactElement, ReactNode } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { HuntDetailActionMenu } from '.';

// Edit, Clone and Delete reach their own APIs. What is under test is the enable action.
vi.mock('@/Hunts/components/UpdateHuntDrawer', () => ({
  UpdateHuntDrawer: ({ trigger }: { trigger: ReactElement }) => trigger,
}));
vi.mock('@/Hunts/components/CloneHuntModal', () => ({
  CloneHuntModal: ({ trigger }: { trigger: ReactElement }) => trigger,
}));
vi.mock('@/Hunts/components/DeleteHuntModal', () => ({
  DeleteHuntModal: ({ trigger }: { trigger: ReactElement }) => trigger,
}));

const listed = vi.hoisted(() => ({
  autoDisabledAt: null as number | null,
}));
vi.mock('@/Hunts/contexts/ListHuntsContext', () => ({
  useListHuntsContext: () => ({
    setSelectedHuntName: vi.fn(),
    data: {
      items: [
        {
          name: 'windows_audit',
          auto_disabled_at: listed.autoDisabledAt,
          auto_disabled_reason: 'resource_limit:241',
        },
      ],
    },
  }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  listed.autoDisabledAt = null;
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
  global_target_table_name: 'alerts',
  global_source_table_name: 'windows_audit',
  customers: ['acme'],
  rules: [{ rule_name: 'brute_force' }],
  enabled: true,
  auto_disabled_reason: '',
  error: '',
};

const RunStateTag = ({ hunt: detail }: { hunt: THuntDetailResponse }) => (
  <HuntStateTag {...useHuntRunState(detail)} />
);

describe('HuntDetailActionMenu enable action', () => {
  it.each([
    {
      case: 'an enabled hunt',
      enabled: true,
      autoDisabledAt: null,
      label: 'Disable Hunt',
      sent: false,
      notice: 'Hunt Windows audit disabled',
    },
    {
      case: 'a disabled hunt',
      enabled: false,
      autoDisabledAt: null,
      label: 'Enable Hunt',
      sent: true,
      notice: 'Hunt Windows audit enabled',
    },
    {
      case: 'a hunt the runner stopped',
      enabled: false,
      autoDisabledAt: 1_763_300_000,
      label: 'Re-enable Hunt',
      sent: true,
      notice: 'Hunt Windows audit enabled',
    },
  ])(
    'offers $label for $case and sends enabled: $sent',
    async ({ enabled, autoDisabledAt, label, sent: expected, notice }) => {
      listed.autoDisabledAt = autoDisabledAt;
      let body: Record<string, unknown> | undefined;
      server.use(
        http.get('/api/v1/hunts/windows_audit', () =>
          HttpResponse.json({ ...hunt, enabled }),
        ),
        http.put('/api/v1/hunts/windows_audit', async ({ request }) => {
          body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(hunt);
        }),
      );
      render(<HuntDetailActionMenu hunt={{ ...hunt, enabled }} />, { wrapper });

      await userEvent.click(await screen.findByRole('button', { name: label }));

      await waitFor(() => expect(body).toBeDefined());
      expect(body).toMatchObject({
        enabled: expected,
        cron: '*/5 * * * *',
        global_source_table_name: 'windows_audit',
      });
      expect(await screen.findByText(notice)).toBeInTheDocument();
    },
  );

  it('writes the config the server holds now, not the one the page loaded', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.get('/api/v1/hunts/windows_audit', () =>
        HttpResponse.json({ ...hunt, cron: '0 3 * * *', log_buffer: 15 }),
      ),
      http.put('/api/v1/hunts/windows_audit', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(hunt);
      }),
    );
    render(<HuntDetailActionMenu hunt={hunt} />, { wrapper });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Disable Hunt' }),
    );

    await waitFor(() => expect(body).toBeDefined());
    expect(body).toMatchObject({
      enabled: false,
      cron: '0 3 * * *',
      log_buffer: 15,
    });
  });

  it('sends the direction the server state calls for, not the one on the page', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.get('/api/v1/hunts/windows_audit', () =>
        HttpResponse.json({ ...hunt, enabled: false }),
      ),
      http.put('/api/v1/hunts/windows_audit', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(hunt);
      }),
    );
    render(<HuntDetailActionMenu hunt={hunt} />, { wrapper });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Disable Hunt' }),
    );

    await waitFor(() => expect(body).toBeDefined());
    expect(body).toMatchObject({ enabled: true });
    expect(
      await screen.findByText('Hunt Windows audit enabled'),
    ).toBeInTheDocument();
  });

  it('raises the notice only after the refetch has cleared the stop', async () => {
    let stopped = true;
    server.use(
      http.get('/api/v1/hunts/windows_audit', async () => {
        if (!stopped) {
          await delay(150);
        }
        return HttpResponse.json({
          ...hunt,
          auto_disabled_at: stopped ? 1_763_300_000 : null,
          auto_disabled_reason: stopped ? 'resource_limit:241' : '',
        });
      }),
      http.put('/api/v1/hunts/windows_audit', () => {
        stopped = false;
        return HttpResponse.json(hunt);
      }),
    );
    const StoppedHunt = () => {
      const { data } = useFetchHuntDetail({ name: 'windows_audit' });
      if (!data) {
        return null;
      }
      return (
        <>
          <RunStateTag hunt={data} />
          <HuntDetailActionMenu hunt={data} />
        </>
      );
    };
    render(<StoppedHunt />, { wrapper });
    expect(await screen.findByText('Auto-disabled')).toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Re-enable Hunt' }),
    );

    expect(
      await screen.findByText('Hunt Windows audit enabled'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Auto-disabled')).toBeNull();
  });

  it('reports a failed fresh read and sends no update', async () => {
    let putSent = false;
    server.use(
      http.get('/api/v1/hunts/windows_audit', () =>
        HttpResponse.json({ detail: 'gone' }, { status: 500 }),
      ),
      http.put('/api/v1/hunts/windows_audit', () => {
        putSent = true;
        return HttpResponse.json(hunt);
      }),
    );
    render(<HuntDetailActionMenu hunt={hunt} />, { wrapper });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Disable Hunt' }),
    );

    expect(
      await screen.findByText('Hunt Windows audit was not disabled'),
    ).toBeInTheDocument();
    expect(putSent).toBe(false);
  });
});
