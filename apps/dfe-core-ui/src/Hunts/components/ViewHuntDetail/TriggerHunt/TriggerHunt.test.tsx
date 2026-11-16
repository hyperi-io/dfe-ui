import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { http, HttpResponse } from 'msw';
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
import { TriggerHunt } from '.';

vi.mock('@/Hunts/contexts/ListHuntsContext', () => ({
  useListHuntsContext: () => ({ data: { items: [] } }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
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
};

const captureRuns = () => {
  const runs: string[] = [];
  server.use(
    http.post('/api/v1/hunts/windows_audit/run', () => {
      runs.push('run');
      return HttpResponse.json({ poll_seconds: 30 });
    }),
  );
  return runs;
};

describe('TriggerHunt', () => {
  it('is disabled with the reason for a hunt the runner stopped, and sends nothing', async () => {
    const runs = captureRuns();
    render(
      <TriggerHunt hunt={{ ...hunt, auto_disabled_at: 1_763_300_000 }} />,
      { wrapper },
    );
    const button = await screen.findByRole('button', {
      name: /Trigger On-Demand/,
    });

    expect(button).toBeDisabled();
    await userEvent.click(button);
    await userEvent.hover(button.parentElement ?? button);

    expect(
      await screen.findByText(
        'The runner stopped this hunt. Re-enable it first.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Trigger On-Demand Hunt')).toBeNull();
    expect(runs).toEqual([]);
  });

  it('queues a run for a hunt the runner is firing', async () => {
    const runs = captureRuns();
    render(<TriggerHunt hunt={{ ...hunt, auto_disabled_at: null }} />, {
      wrapper,
    });
    const button = await screen.findByRole('button', {
      name: /Trigger On-Demand/,
    });

    expect(button).toBeEnabled();
    await userEvent.click(button);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Trigger Hunt' }),
    );

    await waitFor(() => expect(runs).toEqual(['run']));
  });
});
