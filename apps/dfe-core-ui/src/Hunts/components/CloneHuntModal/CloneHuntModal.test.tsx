import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, test, vi } from 'vitest';
import { CloneHuntModal } from '.';

vi.mock('@/Hunts/contexts/ListHuntsContext', () => ({
  useListHuntsContext: () => ({ refetch: vi.fn() }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const hunt: THuntDetailResponse = {
  name: 'windows_audit',
  display_name: 'Windows audit',
  cron: '*/5 * * * *',
  log_buffer: 60,
  global_target_table_name: 'alerts',
  global_source_table_name: 'windows_audit',
  customers: ['acme'],
  rules: [{ rule_name: 'brute_force' }],
};

describe('CloneHuntModal name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<CloneHuntModal hunt={hunt} />, { wrapper });
      await userEvent.click(
        await screen.findByRole('button', { name: 'Clone Windows audit' }),
      );

      await expectNameRule({
        input: await screen.findByLabelText(/^Name/),
        message: RULE_HUNT_NAME_VALIDATOR.message('Name'),
        accepts: ['windows-audit_copy', 'a'.repeat(300)],
        refuses: ['windows.audit', 'windows audit'],
      });
    },
  );
});
