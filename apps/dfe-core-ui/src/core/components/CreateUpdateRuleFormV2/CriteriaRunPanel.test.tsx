import { Form } from '@/core/components/Form';
import {
  ADMIN_MOCKED_RESPONSE,
  server,
} from '@/core/components/RbacProtected/hooks/hooks.mocks';
import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
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
import { CriteriaRunPanel } from './CriteriaRunPanel';
import { CreateUpdateRuleFormData } from './schema';

type TRunResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof API_CONFIG.rulesV2.run, 'post'>
>;

vi.mock('@/core/components/SourceSelect', () => ({
  SourceSelect: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange?: (next: string) => void;
  }) => (
    <input
      aria-label="Source"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const initialValues: Partial<CreateUpdateRuleFormData> = {
  name: 'suspicious_logins',
  cel_filter: 'event.action == "login"',
  source_type: 'raw',
};

const ranNothing: TRunResponse = {
  source: 'winlog',
  source_db: 'dfe',
  source_table: 'winlog',
  cost_window_minutes: 60,
  cost_estimate: { band: 'unmeasured', window_minutes: 60 },
  sql_errors: [],
  columns: [],
  results: [],
  execution_time_ms: 0,
  truncated: false,
};

const grant = (permissions: string[]) =>
  server.use(
    API_CONFIG_MOCKS.auth.me.get.success({
      mockedResponse: { ...ADMIN_MOCKED_RESPONSE, permissions },
    }),
  );

const renderPanel = () =>
  render(
    <Form initialValues={initialValues}>
      {/* The panel reads the detection from the form, so the fields are registered here. */}
      <Form.Item name="cel_filter" hidden>
        <input />
      </Form.Item>
      <Form.Item name="source_type" hidden>
        <input />
      </Form.Item>
      <CriteriaRunPanel
        field="cel_filter"
        criteriaReady
        onValidateCriteria={() => undefined}
        onRun={() => undefined}
      >
        {({ actions, results, open }) => (
          <>
            {actions}
            {open && results}
          </>
        )}
      </CriteriaRunPanel>
    </Form>,
    { wrapper },
  );

describe('CriteriaRunPanel', () => {
  test('runs the detection as the rule, beside the source it reads', async () => {
    grant(['rule:validate', 'schema:read']);
    let received: unknown;
    server.use(
      http.post(API_CONFIG_MOCKS.rulesV2.run.mockedUrl, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json(ranNothing);
      }),
    );
    const user = userEvent.setup();
    renderPanel();

    await user.click(await screen.findByRole('button', { name: /test/i }));
    await user.type(screen.getByLabelText('Source'), 'winlog');
    await user.click(screen.getByRole('button', { name: /run/i }));

    await waitFor(() =>
      expect(received).toEqual({
        source: 'winlog',
        rule: { source_type: 'raw', cel_filter: 'event.action == "login"' },
      }),
    );
  });

  test.each([
    { permissions: ['rule:write'], missing: 'both grants' },
    { permissions: ['rule:validate'], missing: 'schema:read' },
    { permissions: ['schema:read'], missing: 'rule:validate' },
  ])('offers no Test to a caller without $missing', async ({ permissions }) => {
    grant(permissions);
    renderPanel();

    expect(await screen.findByRole('button', { name: /test/i })).toBeDisabled();
  });
});
