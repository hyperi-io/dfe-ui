import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { PromoteRowsProvider } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { SourceDetailsProvider } from '@/Sources/contexts/SourceDetailsContext';
import { TSampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { SampleEventsTabContent } from '.';

// The wizards behind the banner load Ace, which needs a browser global jsdom lacks.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

const selected = vi.hoisted(() => ({
  name: 'orders',
  resourceType: 'custom' as 'core' | 'custom',
}));

vi.mock('@/Sources/contexts/ListSourcesContext', () => ({
  useListSourcesContext: () => ({
    selectedSourceName: selected.name,
    selectedSourceVersion: '1.0.0',
  }),
}));

vi.mock('@/Sources/hooks/useFetchSourceDetail', () => ({
  useFetchSourceDetail: () => ({
    data: {
      source: selected.name,
      resource_type: selected.resourceType,
      version: { schema: { meta_schema: null } },
    },
    isLoading: false,
    error: null,
  }),
}));

const EVENT = {
  _uuid: 'row-1',
  _json: {
    action: 'login',
    user: { email: 'ada@example.com', id: 7 },
    tags: ['red', 'blue'],
  },
};

const sampleRows = (
  source_name: string,
  table: string,
): TSampleRowsResponse => ({
  source_name,
  table,
  match_field: null,
  match_value: null,
  columns: ['_uuid', '_json'],
  rows: [EVENT],
  promoted: [],
});

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  ...['orders', 'main', 'landing'].map((source_name) =>
    API_CONFIG_MOCKS.schemas.sampleRows.get.success({
      source_name,
      mockedResponse: sampleRows(
        source_name,
        source_name === 'landing' ? 'dfe.landing' : 'dfe.main',
      ),
    }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const selectSource = (name: string, resourceType: 'core' | 'custom') => {
  selected.name = name;
  selected.resourceType = resourceType;
};

beforeEach(() => selectSource('orders', 'custom'));

const SampleEvents = () => (
  <SourceDetailsProvider>
    <PromoteRowsProvider source_name={selected.name} version="1.0.0">
      <SampleEventsTabContent />
    </PromoteRowsProvider>
  </SourceDetailsProvider>
);

const renderSampleEvents = () => {
  const { wrapper } = buildTestWrapper().withReactQuery().withTheme();
  return render(<SampleEvents />, { wrapper });
};

const toggleFor = (key: string) =>
  screen.getByRole('button', {
    name: (name) => name.startsWith(`"${key}"`),
  });

const promoteActions = () =>
  screen.queryAllByRole('button', { name: /^Actions for / });

const markForPromote = async (
  user: ReturnType<typeof userEvent.setup>,
  fieldPath: string,
) => {
  await user.click(
    screen.getByRole('button', { name: `Actions for ${fieldPath}` }),
  );
  await user.click(
    await screen.findByRole('button', { name: 'Promote Field' }),
  );
};

describe('SampleEventsTabContent', () => {
  describe('on a source of its own', () => {
    test('shows the event as a tree that expands nested objects and arrays', async () => {
      const user = userEvent.setup();
      renderSampleEvents();

      expect(await screen.findByText('"action"')).toBeInTheDocument();
      expect(screen.queryByText('"email"')).not.toBeInTheDocument();

      await user.click(toggleFor('user'));
      expect(screen.getByText('"ada@example.com"')).toBeInTheDocument();

      await user.click(toggleFor('tags'));
      expect(screen.getByText('"blue"')).toBeInTheDocument();

      await user.click(toggleFor('user'));
      expect(screen.queryByText('"email"')).not.toBeInTheDocument();
    });

    test('offers promote on fields and arrays, never on objects or array items', async () => {
      const user = userEvent.setup();
      renderSampleEvents();
      await screen.findByText('"action"');

      await user.click(toggleFor('user'));
      await user.click(toggleFor('tags'));

      const offered = promoteActions().map((button) =>
        button.getAttribute('aria-label'),
      );
      expect(offered).toEqual(
        expect.arrayContaining([
          'Actions for _json.action',
          'Actions for _json.user.email',
          'Actions for _json.user.id',
          'Actions for _json.tags',
        ]),
      );
      expect(offered).not.toContain('Actions for _json.user');
      expect(offered).not.toContain('Actions for _json');
      expect(offered).not.toContain('Actions for _uuid');
      expect(offered.some((label) => /_json\.tags\.\d/.test(label ?? ''))).toBe(
        false,
      );
    });

    test('a field marked for promote raises the banner that opens the wizard', async () => {
      const user = userEvent.setup();
      renderSampleEvents();
      await screen.findByText('"action"');

      await markForPromote(user, '_json.action');

      expect(screen.getByText('Fields for Promote')).toBeInTheDocument();
      expect(
        await screen.findByRole('button', { name: 'Promote Fields' }),
      ).toBeEnabled();
    });
  });

  describe('on main', () => {
    beforeEach(() => selectSource('main', 'core'));

    test('shows the same tree with no promote action, banner or wizard', async () => {
      const user = userEvent.setup();
      renderSampleEvents();

      expect(await screen.findByText('"action"')).toBeInTheDocument();
      await user.click(toggleFor('user'));
      await user.click(toggleFor('tags'));
      expect(screen.getByText('"ada@example.com"')).toBeInTheDocument();

      expect(promoteActions()).toHaveLength(0);
      expect(screen.queryByText('Fields for Promote')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Promote Fields' }),
      ).not.toBeInTheDocument();
    });

    test('names the table the engine sampled, not a hard-coded one', async () => {
      renderSampleEvents();

      expect(
        await screen.findByText('Source is sampled from'),
      ).toBeInTheDocument();
      expect(screen.getByText('dfe.main.')).toBeInTheDocument();
      expect(screen.queryByText(/_main_land/)).not.toBeInTheDocument();
    });

    test('drops a promote selection carried over from another source', async () => {
      const user = userEvent.setup();
      selectSource('orders', 'custom');
      const { rerender } = renderSampleEvents();
      await screen.findByText('"action"');
      await markForPromote(user, '_json.action');
      expect(screen.getByText('Fields for Promote')).toBeInTheDocument();

      selectSource('main', 'core');
      rerender(<SampleEvents />);

      expect(
        await screen.findByText('Source is sampled from'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Fields for Promote')).not.toBeInTheDocument();
      expect(promoteActions()).toHaveLength(0);
    });
  });

  test('a core landing source under another name gets no promote either', async () => {
    selectSource('landing', 'core');
    renderSampleEvents();

    expect(await screen.findByText('"action"')).toBeInTheDocument();
    expect(promoteActions()).toHaveLength(0);
  });
});
