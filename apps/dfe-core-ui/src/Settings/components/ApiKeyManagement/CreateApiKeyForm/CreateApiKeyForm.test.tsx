import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { STORE_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import {
  listedOrgs,
  MockIntersectionObserver,
  signedInAs,
} from '@/core/components/AccountOrgFormItem/AccountOrgFormItem.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { render, screen, waitFor } from '@testing-library/react';
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
import { CreateApiKeyForm } from '.';

// The group picker reads the groups list, and the name rule does not.
vi.mock('@/Settings/components/GroupManagement/GroupRoleSelect', () => ({
  GroupRoleSelect: () => null,
}));

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const server = setupServer(signedInAs(''), listedOrgs);
const sent: Request[] = [];

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  sent.length = 0;
  server.events.on('request:start', ({ request }) => {
    if (request.method !== 'GET') sent.push(request.clone());
  });
});
afterEach(() => {
  server.events.removeAllListeners();
  server.resetHandlers();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateApiKeyForm name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<CreateApiKeyForm />, { wrapper });

      await expectNameRule({
        input: screen.getByLabelText(/^Name/),
        message: STORE_NAME_VALIDATOR.message('Name'),
        accepts: ['ci-deploy.1', 'a'.repeat(128)],
        refuses: ['-ci', '.ci', 'ci deploy', 'a'.repeat(129)],
      });
    },
  );
});

describe('CreateApiKeyForm organisation', () => {
  test.each([
    { name: 'the signed-in org', me: 'acme', pick: undefined, sends: 'acme' },
    {
      name: 'no org for a user bound to none',
      me: '',
      pick: undefined,
      sends: '',
    },
    { name: 'the org picked', me: 'acme', pick: 'Globex', sends: 'globex' },
  ])('sends $name', async ({ me, pick, sends }) => {
    server.use(signedInAs(me), API_CONFIG_MOCKS.apiKeys.default.post.success());
    const user = userEvent.setup();
    render(<CreateApiKeyForm />, { wrapper });
    if (me) {
      expect(await screen.findByTitle('Acme Corp')).toBeInTheDocument();
    }

    await user.type(screen.getByLabelText(/^Name/), 'ci-deploy');
    await user.type(screen.getByLabelText(/^Description/), 'CI deploys');
    if (pick) {
      await user.click(screen.getByRole('combobox', { name: 'Organisation' }));
      await user.click(await screen.findByTitle(pick));
    }
    await user.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(await sent[0]?.json()).toMatchObject({ org: sends });
  });
});
