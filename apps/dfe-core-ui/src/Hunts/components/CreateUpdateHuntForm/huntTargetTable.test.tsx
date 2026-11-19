import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CreateHuntDrawer } from '@/Hunts/components/CreateHuntDrawer';
import { UpdateHuntDrawer } from '@/Hunts/components/UpdateHuntDrawer';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

vi.mock('@/Hunts/contexts/ListHuntsContext', () => ({
  useListHuntsContext: () => ({
    setSelectedHuntName: vi.fn(),
  }),
}));

// The pickers read organisations, sources and rules from the API. Each stands in
// as a text box holding the same value shape, so the request is the real one.
vi.mock('@/core/components/OrganisationSelect', () => ({
  OrganisationSelect: ({
    value,
    onChange,
  }: {
    value?: string[];
    onChange?: (next: string[]) => void;
  }) => (
    <input
      aria-label="Organisation picker"
      value={(value ?? []).join(',')}
      onChange={(event) =>
        onChange?.(event.target.value.split(',').filter(Boolean))
      }
    />
  ),
}));
vi.mock('@/core/components/SourceSelect', () => ({
  SourceSelect: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange?: (next: string) => void;
  }) => (
    <input
      aria-label="Source picker"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));
vi.mock('@/Hunts/components/CreateUpdateHuntForm/RuleSelectCreate', () => ({
  RuleSelect: ({
    value,
    onChange,
  }: {
    value?: string[];
    onChange?: (next: string[]) => void;
  }) => (
    <input
      aria-label="Rule picker"
      value={(value ?? []).join(',')}
      onChange={(event) =>
        onChange?.(event.target.value.split(',').filter(Boolean))
      }
    />
  ),
}));
vi.mock('@/Hunts/components/CRONBuilderDrawer', () => ({
  CRONBuilderDrawer: () => null,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const TEST_TIMEOUT_MS = 60_000;
const TARGET_HINT =
  'Leave blank to write detections to the default detection table.';

type RequestBody = Record<string, unknown>;

const hunt: THuntDetailResponse = {
  name: 'windows_audit',
  display_name: 'Windows audit',
  cron: ['*/5 * * * *'],
  log_buffer: 60,
  global_target_table_name: 'alerts',
  global_source_table_name: 'windows_audit',
  customers: ['acme'],
  rules: [{ rule_name: 'brute_force' }],
  enabled: true,
  auto_disabled_reason: '',
  error: '',
};

/** Records the body of the one write the form sends, and answers it. */
const captureWrite = (method: 'post' | 'put', path: string) => {
  const sent: { body?: RequestBody } = {};
  server.use(
    http[method](path, async ({ request }) => {
      sent.body = (await request.json()) as RequestBody;
      return HttpResponse.json(hunt, { status: method === 'post' ? 201 : 200 });
    }),
  );
  return sent;
};

const paste = async (input: HTMLElement, value: string) => {
  const user = userEvent.setup({ delay: null });
  await user.clear(input);
  if (value !== '') {
    await user.paste(value);
  }
};

const openDrawer = async (trigger: string) => {
  await userEvent.click(await screen.findByRole('button', { name: trigger }));
  return within(await screen.findByRole('dialog'));
};

const fillNewHunt = async (
  drawer: ReturnType<typeof within>,
  { source, target }: { source: string; target: string },
) => {
  await paste(drawer.getByLabelText(/^Name/), 'windows-audit');
  await paste(drawer.getByLabelText('Organisation picker'), 'acme');
  await paste(drawer.getByLabelText('Rule picker'), 'brute_force');
  await paste(drawer.getByLabelText('Source picker'), source);
  await paste(drawer.getByLabelText(/^Target Table/), target);
};

describe('Add Hunt target and source table', () => {
  test(
    'sends no target table key when the field is blank',
    { timeout: TEST_TIMEOUT_MS },
    async () => {
      const sent = captureWrite('post', '/api/v1/hunts');
      render(<CreateHuntDrawer />, { wrapper });
      const drawer = await openDrawer('Add Hunt');

      await fillNewHunt(drawer, { source: 'windows_audit', target: '' });
      await userEvent.click(drawer.getByRole('button', { name: 'Add Hunt' }));

      await waitFor(() => expect(sent.body).toBeDefined());
      expect(sent.body).not.toHaveProperty('global_target_table_name');
      expect(sent.body).toMatchObject({
        name: 'windows-audit',
        global_source_table_name: 'windows_audit',
        customers: ['acme'],
        rules: ['brute_force'],
      });
    },
  );

  test(
    'sends the target table when the field is filled',
    { timeout: TEST_TIMEOUT_MS },
    async () => {
      const sent = captureWrite('post', '/api/v1/hunts');
      render(<CreateHuntDrawer />, { wrapper });
      const drawer = await openDrawer('Add Hunt');

      await fillNewHunt(drawer, { source: 'windows_audit', target: 'alerts' });
      await userEvent.click(drawer.getByRole('button', { name: 'Add Hunt' }));

      await waitFor(() => expect(sent.body).toBeDefined());
      expect(sent.body).toMatchObject({
        global_source_table_name: 'windows_audit',
        global_target_table_name: 'alerts',
      });
    },
  );

  test(
    'says what a blank target does and still refuses a blank source',
    { timeout: TEST_TIMEOUT_MS },
    async () => {
      const sent = captureWrite('post', '/api/v1/hunts');
      render(<CreateHuntDrawer />, { wrapper });
      const drawer = await openDrawer('Add Hunt');

      expect(drawer.getByText(TARGET_HINT)).toBeInTheDocument();
      await fillNewHunt(drawer, { source: '', target: '' });
      await userEvent.click(drawer.getByRole('button', { name: 'Add Hunt' }));

      expect(
        await drawer.findByText('Global source table name is required'),
      ).toBeInTheDocument();
      expect(drawer.getByText(TARGET_HINT)).toBeInTheDocument();
      expect(sent.body).toBeUndefined();
    },
  );
});

describe('Edit Hunt target and source table', () => {
  test(
    'sends the tables as edited, not the ones the hunt came with',
    { timeout: TEST_TIMEOUT_MS },
    async () => {
      const sent = captureWrite('put', '/api/v1/hunts/windows_audit');
      render(<UpdateHuntDrawer hunt={hunt} />, { wrapper });
      const drawer = await openDrawer('Edit Hunt');

      await paste(drawer.getByLabelText('Source picker'), 'dns_audit');
      await paste(drawer.getByLabelText(/^Target Table/), 'dns_alerts');
      await userEvent.click(drawer.getByRole('button', { name: 'Edit Hunt' }));

      await waitFor(() => expect(sent.body).toBeDefined());
      expect(sent.body).toMatchObject({
        global_source_table_name: 'dns_audit',
        global_target_table_name: 'dns_alerts',
      });
    },
  );

  test(
    'sends no target table key once the field is cleared',
    { timeout: TEST_TIMEOUT_MS },
    async () => {
      const sent = captureWrite('put', '/api/v1/hunts/windows_audit');
      render(<UpdateHuntDrawer hunt={hunt} />, { wrapper });
      const drawer = await openDrawer('Edit Hunt');

      expect(drawer.getByLabelText(/^Target Table/)).toHaveValue('alerts');
      await paste(drawer.getByLabelText(/^Target Table/), '');
      await userEvent.click(drawer.getByRole('button', { name: 'Edit Hunt' }));

      await waitFor(() => expect(sent.body).toBeDefined());
      expect(sent.body).not.toHaveProperty('global_target_table_name');
      expect(sent.body).toMatchObject({
        global_source_table_name: 'windows_audit',
      });
    },
  );
});

describe('Add Hunt enabled', () => {
  test.each([
    { case: 'left on', clicks: 0, sent: true },
    { case: 'turned off', clicks: 1, sent: false },
  ])(
    'opens with the switch on and sends enabled: $sent when $case',
    { timeout: TEST_TIMEOUT_MS },
    async ({ clicks, sent: expected }) => {
      const sent = captureWrite('post', '/api/v1/hunts');
      render(<CreateHuntDrawer />, { wrapper });
      const drawer = await openDrawer('Add Hunt');
      const toggle = drawer.getByRole('switch', { name: 'Enabled' });

      expect(toggle).toBeChecked();
      await fillNewHunt(drawer, { source: 'windows_audit', target: '' });
      for (let i = 0; i < clicks; i++) {
        await userEvent.click(toggle);
      }
      await userEvent.click(drawer.getByRole('button', { name: 'Add Hunt' }));

      await waitFor(() => expect(sent.body).toBeDefined());
      expect(sent.body).toMatchObject({ enabled: expected });
    },
  );
});

describe('Edit Hunt enabled', () => {
  test.each([
    { case: 'an enabled hunt left alone', stored: true, clicks: 0 },
    { case: 'a disabled hunt left alone', stored: false, clicks: 0 },
    {
      case: 'an enabled hunt switched off',
      stored: true,
      clicks: 1,
      sent: false,
    },
    {
      case: 'a disabled hunt switched on',
      stored: false,
      clicks: 1,
      sent: true,
    },
  ])(
    'names enabled only when it changed: $case',
    { timeout: TEST_TIMEOUT_MS },
    async ({ stored, clicks, sent: expected }) => {
      const sent = captureWrite('put', '/api/v1/hunts/windows_audit');
      render(<UpdateHuntDrawer hunt={{ ...hunt, enabled: stored }} />, {
        wrapper,
      });
      const drawer = await openDrawer('Edit Hunt');
      const toggle = drawer.getByRole('switch', { name: 'Enabled' });

      expect(toggle.getAttribute('aria-checked')).toBe(String(stored));
      for (let i = 0; i < clicks; i++) {
        await userEvent.click(toggle);
      }
      await userEvent.click(drawer.getByRole('button', { name: 'Edit Hunt' }));

      await waitFor(() => expect(sent.body).toBeDefined());
      if (expected === undefined) {
        expect(sent.body).not.toHaveProperty('enabled');
      } else {
        expect(sent.body).toMatchObject({ enabled: expected });
      }
    },
  );
});

describe('Edit Hunt runner stop', () => {
  test(
    'shows the stop from the detail and saves without naming enabled',
    { timeout: TEST_TIMEOUT_MS },
    async () => {
      const sent = captureWrite('put', '/api/v1/hunts/windows_audit');
      render(
        <UpdateHuntDrawer
          hunt={{
            ...hunt,
            auto_disabled_at: 1_763_300_000,
            auto_disabled_reason: 'resource_limit:241',
            error: '',
          }}
        />,
        { wrapper },
      );
      const drawer = await openDrawer('Edit Hunt');

      expect(
        drawer.getByText(
          /Auto-disabled by the hunt runner on .+ after hitting ClickHouse's memory limit repeatedly\./,
        ),
      ).toBeInTheDocument();
      // The switch shows the effective state, off, and an untouched switch names nothing.
      expect(drawer.getByRole('switch', { name: 'Enabled' })).not.toBeChecked();
      await userEvent.click(drawer.getByRole('button', { name: 'Edit Hunt' }));

      await waitFor(() => expect(sent.body).toBeDefined());
      expect(sent.body).not.toHaveProperty('enabled');
    },
  );
});
