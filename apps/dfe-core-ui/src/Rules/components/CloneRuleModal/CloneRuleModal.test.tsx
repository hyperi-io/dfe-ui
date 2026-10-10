import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, test, vi } from 'vitest';
import { CloneRuleModal } from '.';

vi.mock('@/Rules/contexts/ListRulesContext', () => ({
  useListRulesContext: () => ({ refetch: vi.fn() }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const rule: TRuleDetail = {
  name: 'brute_force',
  display_name: 'Brute force',
  severity: 'high',
  source: 'windows-audit',
  source_db: 'dfe',
  source_table: 'windows_audit',
  where_clause: '1',
  cel_filter: '',
  original_sql: 'SELECT * FROM dfe.windows_audit WHERE 1',
  hunt_name: 'windows_audit',
  created_at: '2026-01-01T00:00:00Z',
};

describe('CloneRuleModal name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<CloneRuleModal rule={rule} />, { wrapper });
      await userEvent.click(
        await screen.findByRole('button', { name: 'Clone Brute force' }),
      );

      await expectNameRule({
        input: await screen.findByLabelText(/^Name/),
        message: RULE_HUNT_NAME_VALIDATOR.message('Name'),
        accepts: ['brute-force_copy', 'a'.repeat(300)],
        refuses: ['brute.force', 'brute force'],
      });
    },
  );
});
