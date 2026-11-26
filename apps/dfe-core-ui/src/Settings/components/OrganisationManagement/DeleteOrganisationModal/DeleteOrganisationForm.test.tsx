import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { DeleteOrganisationForm } from './DeleteOrganisationForm';

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.auth.reauth.post.success(),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const countAccounts = (total: number, asked: (string | null)[] = []) =>
  http.get('/api/v1/auth/accounts', ({ request }) => {
    asked.push(new URL(request.url).searchParams.get('org'));
    return HttpResponse.json({
      items: [],
      total_size: total,
      next_page_token: null,
    });
  });

describe('DeleteOrganisationForm', () => {
  test.each([
    { total: 0, expected: 'Its 0 accounts' },
    { total: 1, expected: 'Its 1 account' },
    { total: 12, expected: 'Its 12 accounts' },
  ])('says it deletes $expected', async ({ total, expected }) => {
    const asked: (string | null)[] = [];
    server.use(countAccounts(total, asked));

    render(
      <DeleteOrganisationForm
        org_name="globex"
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
      { wrapper },
    );

    expect(
      await screen.findByText(
        `${expected}, API keys and sign-in providers are deleted with it. This cannot be undone.`,
      ),
    ).toBeInTheDocument();
    expect(asked).toEqual(['globex']);
  });

  test('deletes once the password in the same panel is accepted', async () => {
    server.use(countAccounts(3));
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteOrganisationForm
        org_name="globex"
        onCancel={() => {}}
        onConfirm={onConfirm}
      />,
      { wrapper },
    );

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Enter your password')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Your password'), 'pw');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledWith(expect.any(String));
  });
});
