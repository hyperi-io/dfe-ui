import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TRuleDetail } from '@/RulesV2/hooks/useFetchRuleDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { UpdateRuleForm } from './UpdateRuleForm';

// Ace's beautify extension reads a global that only the app shell sets.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

const server = setupServer();
const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const rule: TRuleDetail = {
  name: 'brute_force',
  display_name: 'Brute force',
  severity: 'high',
  where_clause: 'failures > 5',
  cel_filter: null,
  match: null,
  original_sql: '',
  created_at: '2026-01-01T00:00:00Z',
};

const SEARCH_SQL = 'SELECT * FROM logs.auth WHERE failures > 5';

describe('UpdateRuleForm', () => {
  test.each([
    [
      'SQL from Search',
      { original_sql: SEARCH_SQL, source_type: 'hyperdx' as const },
      SEARCH_SQL,
    ],
    ['a WHERE fragment', {}, 'failures > 5'],
  ])(
    'opens %s in the SQL editor and saves it as SQL',
    async (_, source, userSql) => {
      let sent: Record<string, unknown> = {};
      server.use(
        http.put(
          API_CONFIG_MOCKS.rulesV2.rule.mockedUrl.replace('{name}', rule.name),
          async ({ request }) => {
            sent = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ rule });
          },
        ),
      );

      render(<UpdateRuleForm rule={{ ...rule, ...source }} />, { wrapper });

      expect(screen.getByRole('radio', { name: 'SQL' })).toBeChecked();
      await userEvent.click(
        screen.getByRole('button', { name: 'Update Rule' }),
      );

      await waitFor(() => expect(sent).toMatchObject({ user_sql: userSql }));
      expect(sent.match ?? null).toBeNull();
    },
  );
});
