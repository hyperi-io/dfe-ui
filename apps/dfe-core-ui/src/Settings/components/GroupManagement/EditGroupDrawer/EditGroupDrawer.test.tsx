import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  GROUP_DRAWER_TEST_TIMEOUT_MS,
  GROUP_FORM_HANDLERS,
  stubIntersectionObserver,
} from '@/Settings/components/GroupManagement/CreateUpdateGroupForm/CreateUpdateGroupForm.mocks';
import { EditGroupDrawer } from '@/Settings/components/GroupManagement/EditGroupDrawer';
import { GROUP_DETAIL_QUERY_KEY } from '@/Settings/hooks/groups/useFetchGroupDetail';
import { TGroupDetailResponse } from '@/Settings/hooks/groups/useFetchGroupDetail/types';
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

const LINKED_GROUP: TGroupDetailResponse = {
  name: 'viewers',
  description: 'Read-only analysts',
  roles: ['viewer'],
  members: [],
  scope: 'system',
  source_id: 'dfe-viewers',
  source_provider: 'okta',
};

// A link saved before a provider was required.
const LEGACY_GROUP: TGroupDetailResponse = {
  ...LINKED_GROUP,
  source_provider: '',
};

const groupUrl = API_CONFIG_MOCKS.groups.group.mockedUrl.replace(
  '{name}',
  LINKED_GROUP.name,
);

const onPut = vi.fn();

const server = setupServer(
  ...GROUP_FORM_HANDLERS,
  http.put(groupUrl, async ({ request }) => {
    onPut(await request.json());
    return HttpResponse.json(LINKED_GROUP);
  }),
);

beforeAll(() => {
  stubIntersectionObserver();
  server.listen({ onUnhandledRequest: 'error' });
});
beforeEach(() => onPut.mockReset());
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

const testWrapper = buildTestWrapper().withReactQuery().withTheme();
const { wrapper } = testWrapper;

const openEditDrawer = async (group: TGroupDetailResponse = LINKED_GROUP) => {
  server.use(
    API_CONFIG_MOCKS.groups.group.get.success({
      mockedResponse: group,
      group_name: group.name,
    }),
  );
  const user = userEvent.setup();
  render(<EditGroupDrawer group_name={LINKED_GROUP.name} refetch={vi.fn()} />, {
    wrapper,
  });
  await user.click(
    await screen.findByRole(
      'button',
      { name: /Edit Group/ },
      { timeout: 15_000 },
    ),
  );
  await screen.findByRole(
    'button',
    { name: 'Update Group' },
    { timeout: 15_000 },
  );
  return user;
};

const submitAndReadBody = async (user: UserEvent) => {
  await user.click(screen.getByRole('button', { name: 'Update Group' }));
  await waitFor(() => expect(onPut).toHaveBeenCalledTimes(1), {
    timeout: 15_000,
  });
  return onPut.mock.calls[0]?.[0];
};

// The drawer's close control is an icon-only button in the header.
const closeDrawer = async (user: UserEvent) => {
  const close = document.querySelector('.ant-drawer-extra button');
  if (!(close instanceof HTMLElement)) {
    throw new Error('no drawer close button');
  }
  await user.click(close);
};

const UNCHANGED_BODY = {
  description: 'Read-only analysts',
  roles: ['viewer'],
  members: [],
};

describe('EditGroupDrawer', { timeout: GROUP_DRAWER_TEST_TIMEOUT_MS }, () => {
  test('the link fields stay editable while the name and scope are not', async () => {
    await openEditDrawer();

    expect(screen.getByLabelText(/^Name/)).toBeDisabled();
    expect(screen.getByLabelText('Source ID')).toBeEnabled();
    expect(screen.getByLabelText('Source ID')).toHaveValue('dfe-viewers');
    expect(screen.getByLabelText('Source Provider')).toBeEnabled();
    expect(screen.getByLabelText('Source Provider')).toHaveValue('okta');
  });

  test('an unedited save sends neither link field', async () => {
    const user = await openEditDrawer();

    expect(await submitAndReadBody(user)).toEqual(UNCHANGED_BODY);
  });

  test('a link moved while the drawer opened is not reverted by an unrelated save', async () => {
    const movedGroup = {
      ...LINKED_GROUP,
      source_id: 'dfe-viewers-moved',
      source_provider: 'entra',
    };
    const onDetail = vi.fn();
    server.use(
      http.get(groupUrl, () => {
        onDetail();
        return HttpResponse.json(movedGroup);
      }),
    );
    const user = userEvent.setup();
    render(
      <EditGroupDrawer group_name={LINKED_GROUP.name} refetch={vi.fn()} />,
      {
        wrapper,
      },
    );
    testWrapper.queryClient?.setQueryData(
      GROUP_DETAIL_QUERY_KEY(LINKED_GROUP.name),
      LINKED_GROUP,
    );

    await user.click(
      await screen.findByRole(
        'button',
        { name: /Edit Group/ },
        { timeout: 15_000 },
      ),
    );
    await waitFor(
      () =>
        expect(
          testWrapper.queryClient?.getQueryData(
            GROUP_DETAIL_QUERY_KEY(LINKED_GROUP.name),
          ),
        ).toEqual(movedGroup),
      { timeout: 15_000 },
    );
    expect(onDetail).toHaveBeenCalled();
    expect(screen.getByLabelText('Source ID')).toHaveValue('dfe-viewers');

    expect(await submitAndReadBody(user)).toEqual(UNCHANGED_BODY);
  });

  test('a refused save shows the engine reason until the drawer is closed', async () => {
    const message =
      "source_provider is required when source_id 'dfe-viewers' is set";
    server.use(
      http.put(groupUrl, () =>
        HttpResponse.json(
          { code: 'missing_source_provider', message },
          { status: 422 },
        ),
      ),
    );
    const user = await openEditDrawer();

    await user.click(screen.getByRole('button', { name: 'Update Group' }));
    expect(
      await screen.findByText(message, {}, { timeout: 15_000 }),
    ).toBeInTheDocument();

    await closeDrawer(user);
    await user.click(screen.getByRole('button', { name: /Edit Group/ }));
    await screen.findByRole(
      'button',
      { name: 'Update Group' },
      { timeout: 15_000 },
    );

    expect(screen.queryByText(message)).not.toBeInTheDocument();
  });

  test.each([
    ['padded', ' padded-id '],
    ['600-character', 'a'.repeat(600)],
  ])(
    'a description edit on a group with a %s stored source ID saves without the link',
    async (_label, source_id) => {
      const user = await openEditDrawer({ ...LINKED_GROUP, source_id });

      await user.clear(screen.getByLabelText('Description'));
      await user.type(screen.getByLabelText('Description'), 'Updated');

      expect(await submitAndReadBody(user)).toEqual({
        ...UNCHANGED_BODY,
        description: 'Updated',
      });
    },
  );

  test('a changed source ID is sent trimmed without the provider', async () => {
    const user = await openEditDrawer();

    await user.clear(screen.getByLabelText('Source ID'));
    await user.type(
      screen.getByLabelText('Source ID'),
      ' 00000000-0000-0000-0000-000000000001 ',
    );

    expect(await submitAndReadBody(user)).toEqual({
      ...UNCHANGED_BODY,
      source_id: '00000000-0000-0000-0000-000000000001',
    });
  });

  test('clearing the source ID sends it empty', async () => {
    const user = await openEditDrawer();

    await user.clear(screen.getByLabelText('Source ID'));

    expect(await submitAndReadBody(user)).toEqual({
      ...UNCHANGED_BODY,
      source_id: '',
    });
  });

  test('a provider that is not suggested is sent on its own', async () => {
    const user = await openEditDrawer();

    await user.clear(screen.getByLabelText('Source Provider'));
    await user.type(screen.getByLabelText('Source Provider'), 'corp-proxy ');

    expect(await submitAndReadBody(user)).toEqual({
      ...UNCHANGED_BODY,
      source_provider: 'corp-proxy',
    });
  });

  test('clearing both link fields unlinks the group', async () => {
    const user = await openEditDrawer();

    await user.clear(screen.getByLabelText('Source ID'));
    await user.clear(screen.getByLabelText('Source Provider'));

    expect(await submitAndReadBody(user)).toEqual({
      ...UNCHANGED_BODY,
      source_id: '',
      source_provider: '',
    });
  });

  test('clearing the provider of a linked group is refused before it is sent', async () => {
    const user = await openEditDrawer();

    await user.clear(screen.getByLabelText('Source Provider'));
    await user.click(screen.getByRole('button', { name: 'Update Group' }));

    expect(
      await screen.findByText(
        'Source provider is required with a source ID',
        {},
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
    expect(onPut).not.toHaveBeenCalled();
  });

  test('an unchanged link with no provider does not block an edit', async () => {
    const user = await openEditDrawer(LEGACY_GROUP);

    await user.clear(screen.getByLabelText('Description'));
    await user.type(screen.getByLabelText('Description'), 'Updated');

    expect(await submitAndReadBody(user)).toEqual({
      ...UNCHANGED_BODY,
      description: 'Updated',
    });
  });

  test('changing the source ID of a link with no provider requires one', async () => {
    const user = await openEditDrawer(LEGACY_GROUP);

    await user.clear(screen.getByLabelText('Source ID'));
    await user.type(screen.getByLabelText('Source ID'), 'dfe-analysts');
    await user.click(screen.getByRole('button', { name: 'Update Group' }));

    expect(
      await screen.findByText(
        'Source provider is required with a source ID',
        {},
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
    expect(onPut).not.toHaveBeenCalled();
  });

  test('clearing the source ID of a link with no provider saves', async () => {
    const user = await openEditDrawer(LEGACY_GROUP);

    await user.clear(screen.getByLabelText('Source ID'));

    expect(await submitAndReadBody(user)).toEqual({
      ...UNCHANGED_BODY,
      source_id: '',
    });
  });

  test('a changed source ID over 512 characters is refused before it is sent', async () => {
    const user = await openEditDrawer();

    await user.clear(screen.getByLabelText('Source ID'));
    await user.paste('a'.repeat(513));
    await user.click(screen.getByRole('button', { name: 'Update Group' }));

    expect(
      await screen.findByText(
        'Source ID is at most 512 characters',
        {},
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
    expect(onPut).not.toHaveBeenCalled();
  });
});
