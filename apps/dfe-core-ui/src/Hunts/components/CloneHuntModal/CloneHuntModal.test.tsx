import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
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

const openClone = async (source: THuntDetailResponse) => {
  render(<CloneHuntModal hunt={source} />, { wrapper });
  await userEvent.click(
    await screen.findByRole('button', { name: 'Clone Windows audit' }),
  );
  return screen.findByLabelText(/^Name/);
};

describe('CloneHuntModal name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      await expectNameRule({
        input: await openClone(hunt),
        message: RULE_HUNT_NAME_VALIDATOR.message('Name'),
        accepts: ['windows-audit_copy', '-leading', 'a'.repeat(128)],
        refuses: ['windows.audit', '.leading', 'a'.repeat(129)],
      });
    },
  );

  test.each([
    ['a 128-character name', 'a'.repeat(128), `${'a'.repeat(123)}_copy`],
    [
      'a name the create endpoint refuses',
      'imported.hunt',
      'imported_hunt_copy',
    ],
  ])(
    'offers a copy name the engine takes for %s, and sends it',
    async (_label, name, copy) => {
      let sent: unknown;
      server.use(
        http.post(
          API_CONFIG_MOCKS.hunts.default.mockedUrl,
          async ({ request }) => {
            sent = await request.json();
            return HttpResponse.json({ ...hunt, name: copy });
          },
        ),
      );

      const input = await openClone({ ...hunt, name });

      expect(input).toHaveValue(copy);
      await userEvent.click(screen.getByRole('button', { name: 'Clone' }));
      await waitFor(() => expect(sent).toMatchObject({ name: copy }));
    },
  );
});
