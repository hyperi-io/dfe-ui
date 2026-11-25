import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CreateGroupDrawer } from '@/Settings/components/GroupManagement/CreateGroupDrawer';
import {
  GROUP_DRAWER_TEST_TIMEOUT_MS,
  GROUP_FORM_HANDLERS,
  stubIntersectionObserver,
} from '@/Settings/components/GroupManagement/CreateUpdateGroupForm/CreateUpdateGroupForm.mocks';
import { TGroupCreateResponse } from '@/Settings/hooks/groups/useCreateGroup/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
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

const CREATED_GROUP: TGroupCreateResponse = {
  name: 'viewers',
  description: '',
  roles: ['viewer'],
  members: [],
  scope: 'system',
  source_id: 'dfe-viewers',
  source_provider: 'okta',
};

const onPost = vi.fn();

const server = setupServer(
  ...GROUP_FORM_HANDLERS,
  http.post(API_CONFIG_MOCKS.groups.default.mockedUrl, async ({ request }) => {
    onPost(await request.json());
    return HttpResponse.json(CREATED_GROUP);
  }),
);

beforeAll(() => {
  stubIntersectionObserver();
  server.listen({ onUnhandledRequest: 'error' });
});
beforeEach(() => onPost.mockReset());
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const openCreateDrawer = async () => {
  const user = userEvent.setup();
  render(<CreateGroupDrawer />, { wrapper });
  await user.click(
    await screen.findByRole(
      'button',
      { name: /Configure New Group/ },
      { timeout: 15_000 },
    ),
  );
  await screen.findByRole('button', { name: 'Create Group' });
  return user;
};

const fillRequiredFields = async (user: UserEvent) => {
  await user.type(screen.getByLabelText(/^Name/), 'viewers');
  await user.click(screen.getByLabelText(/^Roles/));
  await user.click(await screen.findByTitle('viewer', {}, { timeout: 15_000 }));
};

// The drawer's close control is an icon-only button in the header.
const closeDrawer = async (user: UserEvent) => {
  const close = document.querySelector('.ant-drawer-extra button');
  if (!(close instanceof HTMLElement)) {
    throw new Error('no drawer close button');
  }
  await user.click(close);
};

const submit = async (user: UserEvent) => {
  await user.click(screen.getByRole('button', { name: 'Create Group' }));
  // A form that passes asks for the password before it creates anything.
  const password = await screen
    .findByLabelText('Your password', {}, { timeout: 1000 })
    .catch(() => undefined);
  if (password) {
    await user.type(password, 'pw');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
  }
};

describe('CreateGroupDrawer', { timeout: GROUP_DRAWER_TEST_TIMEOUT_MS }, () => {
  test('marks only the fields a group needs as required', async () => {
    await openCreateDrawer();

    const required = Array.from(
      document.querySelectorAll('label.ant-form-item-required'),
    ).map((label) => label.textContent);
    expect(required).toEqual(['Name', 'Roles']);
  });

  test('a source ID and a suggested provider reach the POST body trimmed', async () => {
    const user = await openCreateDrawer();
    await fillRequiredFields(user);

    await user.type(screen.getByLabelText('Source ID'), ' dfe-viewers ');
    await user.click(screen.getByLabelText('Source Provider'));
    await user.click(
      await screen.findByTitle('Okta (okta)', {}, { timeout: 15_000 }),
    );
    await submit(user);

    await waitFor(() => expect(onPost).toHaveBeenCalledTimes(1), {
      timeout: 15_000,
    });
    expect(onPost.mock.calls[0]?.[0]).toEqual({
      name: 'viewers',
      description: '',
      roles: ['viewer'],
      members: [],
      source_id: 'dfe-viewers',
      source_provider: 'okta',
    });
  });

  test('a group left unlinked sends empty link fields', async () => {
    const user = await openCreateDrawer();
    await fillRequiredFields(user);
    await submit(user);

    await waitFor(() => expect(onPost).toHaveBeenCalledTimes(1), {
      timeout: 15_000,
    });
    expect(onPost.mock.calls[0]?.[0]).toMatchObject({
      source_id: '',
      source_provider: '',
    });
  });

  test('the provider suggestions are the OIDC providers and scim', async () => {
    const user = await openCreateDrawer();

    // antd draws the AutoComplete placeholder beside the input, not on it.
    expect(screen.getByText('Select or enter a provider')).toBeInTheDocument();
    expect(screen.queryByText(/any provider/i)).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Source Provider'));

    expect(
      await screen.findByTitle('Okta (okta)', {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Entra ID (entra)')).toBeInTheDocument();
    expect(screen.getByTitle('SCIM (scim)')).toBeInTheDocument();
  });

  test('a source ID over 512 characters is refused before it is sent', async () => {
    const user = await openCreateDrawer();
    await fillRequiredFields(user);

    await user.click(screen.getByLabelText('Source ID'));
    await user.paste('a'.repeat(513));
    await submit(user);

    expect(
      await screen.findByText(
        'Source ID is at most 512 characters',
        {},
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
    expect(onPost).not.toHaveBeenCalled();
  });

  test('the reason the engine refuses a source ID is shown on the form', async () => {
    const message = "source_id 'dfe-viewers' is already another group's";
    server.use(
      http.post(API_CONFIG_MOCKS.groups.default.mockedUrl, () =>
        HttpResponse.json(
          { title: 'Error', code: 'conflict', detail: message },
          { status: 409 },
        ),
      ),
    );
    const user = await openCreateDrawer();
    await fillRequiredFields(user);

    await user.type(screen.getByLabelText('Source ID'), 'dfe-viewers');
    await user.type(screen.getByLabelText('Source Provider'), 'okta');
    await submit(user);

    expect(
      await screen.findByText(message, {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
    // The engine refuses the create before it asks for the password.
    expect(screen.queryByLabelText('Your password')).not.toBeInTheDocument();
  });

  test('asks for the password only when the engine says the create needs it, then retries with the grant', async () => {
    const sent: (string | null)[] = [];
    server.use(
      API_CONFIG_MOCKS.auth.reauth.post.success(),
      http.post(API_CONFIG_MOCKS.groups.default.mockedUrl, ({ request }) => {
        const grant = request.headers.get('X-DFE-Reauth');
        sent.push(grant);
        return grant
          ? HttpResponse.json(CREATED_GROUP)
          : HttpResponse.json(
              {
                title: 'Forbidden',
                code: 'reauth_required',
                detail: 'Confirm it is you',
              },
              { status: 403 },
            );
      }),
    );
    const user = await openCreateDrawer();
    await fillRequiredFields(user);

    await submit(user);

    await waitFor(() => expect(sent).toHaveLength(2));
    expect(sent[0]).toBeNull();
    expect(sent[1]).toBeTruthy();
  });

  test('a refused create no longer shows its reason once the drawer is reopened', async () => {
    const message = "source_id 'dfe-viewers' is already another group's";
    server.use(
      http.post(API_CONFIG_MOCKS.groups.default.mockedUrl, () =>
        HttpResponse.json(
          { title: 'Error', code: 'conflict', detail: message },
          { status: 409 },
        ),
      ),
    );
    const user = await openCreateDrawer();
    await fillRequiredFields(user);
    await submit(user);
    expect(
      await screen.findByText(message, {}, { timeout: 15_000 }),
    ).toBeInTheDocument();

    await closeDrawer(user);
    await user.click(
      screen.getByRole('button', { name: /Configure New Group/ }),
    );
    await screen.findByRole('button', { name: 'Create Group' });

    expect(screen.queryByText(message)).not.toBeInTheDocument();
  });

  test('a source ID without a provider is refused before it is sent', async () => {
    const user = await openCreateDrawer();
    await fillRequiredFields(user);

    await user.type(screen.getByLabelText('Source ID'), 'dfe-viewers');
    await submit(user);

    expect(
      await screen.findByText(
        'Source provider is required with a source ID',
        {},
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
    expect(onPost).not.toHaveBeenCalled();
  });
});
