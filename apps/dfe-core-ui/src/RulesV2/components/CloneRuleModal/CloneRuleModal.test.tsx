import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { TRuleDetail } from '@/RulesV2/hooks/useFetchRuleDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { CloneRuleModal } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const rule: TRuleDetail = {
  name: 'brute_force',
  display_name: 'Brute force',
  severity: 'high',
  where_clause: '1',
  cel_filter: '',
  created_at: '2026-01-01T00:00:00Z',
  original_sql: 'string',
  description: 'string',
};

const openClone = async (source: TRuleDetail) => {
  render(<CloneRuleModal rule={source} />, { wrapper });
  await userEvent.click(
    await screen.findByRole('button', { name: 'Clone Brute force' }),
  );
  return screen.findByLabelText(/^Name/);
};

describe('CloneRuleModal name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      await expectNameRule({
        input: await openClone(rule),
        message: RULE_HUNT_NAME_VALIDATOR.message('Name'),
        accepts: ['brute-force_copy', '-leading', 'a'.repeat(128)],
        refuses: ['brute.force', '.leading', 'a'.repeat(129)],
      });
    },
  );

  test.each([
    ['a 128-character name', 'a'.repeat(128), `${'a'.repeat(123)}_copy`],
    [
      'a name the create endpoint refuses',
      'imported.rule',
      'imported_rule_copy',
    ],
  ])(
    'offers a copy name the engine takes for %s, and sends it',
    async (_label, name, copy) => {
      let sent: unknown;
      server.use(
        http.post(
          API_CONFIG_MOCKS.rulesV2.default.mockedUrl,
          async ({ request }) => {
            sent = await request.json();
            return HttpResponse.json({ rule: { ...rule, name: copy } });
          },
        ),
      );

      const input = await openClone({ ...rule, name });

      expect(input).toHaveValue(copy);
      await userEvent.click(screen.getByRole('button', { name: 'Clone' }));
      await waitFor(() => expect(sent).toMatchObject({ name: copy }));
    },
  );
});

describe('CloneRuleModal detection', () => {
  const DETECTIONS = ['match', 'cel_filter', 'user_sql', 'where_clause'];

  test.each([
    [
      'a match',
      {
        match: {
          field: 'user',
          operator: 'equals' as const,
          value: 'root',
          negate: false,
        },
      },
      { match: { field: 'user', operator: 'equals', value: 'root' } },
    ],
    [
      'a CEL filter',
      { cel_filter: 'failures > 5' },
      { cel_filter: 'failures > 5' },
    ],
    [
      'SQL from Search',
      {
        original_sql: 'SELECT * FROM logs.auth WHERE failures > 5',
        source_type: 'hyperdx' as const,
      },
      {
        user_sql: 'SELECT * FROM logs.auth WHERE failures > 5',
        source_type: 'hyperdx',
      },
    ],
    [
      'a WHERE fragment',
      { where_clause: 'failures > 5' },
      { where_clause: 'failures > 5' },
    ],
  ])(
    'sends the one detection of the source rule for %s',
    async (_, source, detection) => {
      let sent: Record<string, unknown> = {};
      server.use(
        http.post(
          API_CONFIG_MOCKS.rulesV2.default.mockedUrl,
          async ({ request }) => {
            sent = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({
              rule: { ...rule, name: 'brute_force_copy' },
            });
          },
        ),
      );

      await openClone({ ...rule, original_sql: '', ...source });
      await userEvent.click(screen.getByRole('button', { name: 'Clone' }));

      await waitFor(() => expect(sent).toMatchObject(detection));
      expect(DETECTIONS.filter((key) => sent[key] != null)).toEqual(
        Object.keys(detection).filter((key) => DETECTIONS.includes(key)),
      );
      expect(sent).toMatchObject({
        display_name: 'Brute force',
        description: 'string',
      });
    },
  );
});
