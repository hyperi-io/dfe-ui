import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TAccountsResponse } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { GroupMemberSelect } from '.';
import { server } from './GroupMemberSelect.mocks';

// The account list observes a sentinel row to page; jsdom has no observer.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const OIDC_SUBJECT = '00u15mxs3ecygt7oj698';

const accounts = (): TAccountsResponse => ({
  items: [
    {
      username: OIDC_SUBJECT,
      enabled: true,
      groups: [],
      created_at: 'string',
      updated_at: 'string',
      email: 'dfe-test@dfe-oidc.test',
      phone: '',
      name: 'DFE dfe-test',
    },
    {
      username: 'admin',
      enabled: true,
      groups: ['dfe-admins'],
      created_at: 'string',
      updated_at: 'string',
      email: '',
      phone: '',
      name: '',
    },
  ],
  total: 2,
  page: 1,
  per_page: 10,
  total_pages: 1,
  next_page: 1,
  prev_page: 1,
});

describe('GroupMemberSelect', () => {
  test('labels members by name and username but selects the username', async () => {
    server.use(
      API_CONFIG_MOCKS.accounts.default.get.success({
        mockedResponse: accounts(),
      }),
    );
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<GroupMemberSelect onChange={onChange} />, { wrapper });

    await user.click(await screen.findByRole('combobox'));

    const oidcOption = await screen.findByTitle(
      `DFE dfe-test (${OIDC_SUBJECT})`,
    );
    expect(screen.getByTitle('admin')).toBeInTheDocument();

    await user.click(oidcOption);

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0]).toEqual([OIDC_SUBJECT]);
  });
});
