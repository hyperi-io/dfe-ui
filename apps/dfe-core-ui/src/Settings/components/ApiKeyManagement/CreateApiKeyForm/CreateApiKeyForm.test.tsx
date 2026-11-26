import { confirmReauth } from '@/core/utils/test-utils/confirmReauth';
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
} from '@/core/components/OrgChoiceFormItem/OrgChoiceFormItem.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
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
vi.mock('@/core/components/AccountGroupSelect', () => ({
  AccountGroupSelect: () => null,
}));

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const server = setupServer(
  API_CONFIG_MOCKS.auth.reauth.post.success(),
  signedInAs(''),
  listedOrgs,
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
  }),
);
const sent: Request[] = [];

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  sent.length = 0;
  server.events.on('request:start', ({ request }) => {
    // The re-auth request earns the grant; only the key itself is sent.
    if (request.method !== 'GET' && !request.url.endsWith('/auth/reauth')) {
      sent.push(request.clone());
    }
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
    {
      name: 'no organisation',
      choice: /^No organisation/,
      pick: undefined,
      sends: '',
    },
    {
      name: 'your organisation by name',
      choice: /^Your organisation/,
      pick: undefined,
      sends: 'hyperi',
    },
    {
      name: 'the customer organisation picked',
      choice: /^Customer organisation/,
      pick: 'Globex',
      sends: 'globex',
    },
  ])('sends $name', async ({ choice, pick, sends }) => {
    server.use(API_CONFIG_MOCKS.apiKeys.default.post.success());
    const user = userEvent.setup();
    render(<CreateApiKeyForm />, { wrapper });

    await user.type(screen.getByLabelText(/^Name/), 'ci-deploy');
    await user.type(screen.getByLabelText(/^Description/), 'CI deploys');
    await user.click(await screen.findByRole('radio', { name: choice }));
    if (pick) {
      await user.click(
        screen.getByRole('combobox', { name: 'Organisation name' }),
      );
      await user.click(await screen.findByTitle(pick));
    }
    await user.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => expect(sent).toHaveLength(1));
    expect(await sent[0]?.json()).toMatchObject({ org: sends });
    expect(screen.queryByLabelText('Your password')).not.toBeInTheDocument();
  });

  test('asks for the password when the engine says the key needs it, then retries with the grant', async () => {
    server.use(
      http.post(API_CONFIG_MOCKS.apiKeys.default.mockedUrl, ({ request }) =>
        request.headers.get('X-DFE-Reauth')
          ? HttpResponse.json({ name: 'ci-deploy', full_key: 'k' })
          : HttpResponse.json(
              {
                title: 'Forbidden',
                code: 'reauth_required',
                detail: 'Confirm it is you',
              },
              { status: 403 },
            ),
      ),
    );
    const user = userEvent.setup();
    render(<CreateApiKeyForm />, { wrapper });

    await user.type(screen.getByLabelText(/^Name/), 'ci-deploy');
    await user.type(screen.getByLabelText(/^Description/), 'CI deploys');
    await user.click(await screen.findByRole('radio', { name: /^No org/ }));
    await user.click(screen.getByRole('button', { name: 'Generate' }));
    await confirmReauth(user);

    await waitFor(() => expect(sent).toHaveLength(2));
    expect(sent.map((r) => r.headers.get('X-DFE-Reauth'))).toEqual([
      null,
      'reauth-grant',
    ]);
  });

  test('generates nothing until an organisation is chosen', async () => {
    const user = userEvent.setup();
    render(<CreateApiKeyForm />, { wrapper });

    await user.type(screen.getByLabelText(/^Name/), 'ci-deploy');
    await user.type(screen.getByLabelText(/^Description/), 'CI deploys');
    await user.click(screen.getByRole('button', { name: 'Generate' }));

    expect(
      await screen.findByText('Choose an organisation'),
    ).toBeInTheDocument();
    expect(sent).toEqual([]);
  });
});
