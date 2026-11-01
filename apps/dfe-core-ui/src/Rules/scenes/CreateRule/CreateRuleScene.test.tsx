import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { server } from '@/Rules/components/CreateUpdateRuleForm/CreateUpdateRuleForm.mocks';
import { act, render, screen } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { CreateRuleScene } from '.';

vi.mock('@/Rules/config/indexedDB', () => ({
  RuleFromSearchDb: { add: vi.fn().mockResolvedValue(undefined), get: vi.fn() },
}));

// Ace needs a real browser, and the SQL is not under test here.
vi.mock('@/core/components/AceEditor', () => ({ AceEditor: () => null }));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withHyperdxPort('8090');

const FROM = { tableName: 'logs', databaseName: 'default' };

describe('CreateRuleScene', () => {
  it('fills the form from a HyperDX search that arrives after the form is up', async () => {
    vi.spyOn(window, 'postMessage').mockImplementation(() => undefined);
    render(<CreateRuleScene />, { wrapper });
    const name = await screen.findByLabelText(/^Name/, {}, { timeout: 5000 });
    expect(name).toHaveValue('');

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'http://localhost:8090',
          source: window,
          data: {
            type: 'CREATE_RULE_FROM_SEARCH',
            payload: {
              savedSearchName: 'failed_logins',
              sql: 'SELECT 1',
              rawSql: 'SELECT 1',
              config: {},
              source: {
                name: 'logs',
                kind: 'log',
                from: FROM,
                connection: 'c',
              },
            },
          },
        }),
      );
    });

    expect(
      await screen.findByDisplayValue('failed_logins', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });
});
