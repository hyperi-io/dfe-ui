import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { stubIntersectionObserver } from '@/Settings/components/GroupManagement/CreateUpdateGroupForm/CreateUpdateGroupForm.mocks';
import { GroupSourceProviderInput } from '@/Settings/components/GroupManagement/GroupSourceProviderInput';
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

const ME_PATH = API_CONFIG_MOCKS.auth.me.mockedUrl;
const PROVIDERS_PATH = API_CONFIG_MOCKS.oidcProviders.default.mockedUrl;

const requested: string[] = [];
const answered: string[] = [];

const server = setupServer();
server.events.on('request:start', ({ request }) => {
  requested.push(new URL(request.url).pathname);
});
server.events.on('response:mocked', ({ request }) => {
  answered.push(new URL(request.url).pathname);
});

beforeAll(() => {
  stubIntersectionObserver();
  server.listen({ onUnhandledRequest: 'error' });
});
beforeEach(() => {
  requested.length = 0;
  answered.length = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

describe('GroupSourceProviderInput', () => {
  test('without oidc:read it suggests scim and asks for no providers', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: {
          ...ADMIN_MOCKED_RESPONSE,
          permissions: ['group:write'],
        },
      }),
    );
    const user = userEvent.setup();
    render(<GroupSourceProviderInput />, { wrapper });
    await waitFor(() => expect(answered).toContain(ME_PATH), {
      timeout: 15_000,
    });

    await user.click(screen.getByRole('combobox'));

    expect(
      await screen.findByTitle('SCIM (scim)', {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
    expect(requested).not.toContain(PROVIDERS_PATH);
  });

  test('text typed before permissions load keeps its input', async () => {
    let releaseMe: () => void = () => undefined;
    const meReleased = new Promise<void>((resolve) => {
      releaseMe = resolve;
    });
    server.use(
      http.get(ME_PATH, async () => {
        await meReleased;
        return HttpResponse.json(ADMIN_MOCKED_RESPONSE);
      }),
      API_CONFIG_MOCKS.oidcProviders.default.get.success(),
    );
    const user = userEvent.setup();
    render(<GroupSourceProviderInput />, { wrapper });
    const input = screen.getByRole('combobox');

    await user.click(input);
    await user.type(input, 'ok');
    releaseMe();
    await waitFor(() => expect(answered).toContain(PROVIDERS_PATH), {
      timeout: 15_000,
    });

    expect(screen.getByRole('combobox')).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('ok');
  });
});
