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
  it,
  vi,
} from 'vitest';
import { DeleteSourceModal } from '.';

const PR = 'https://github.com/acme/deploy/pull/7';
const answer = (body: object) =>
  http.delete('/api/v1/sources/okta', () => HttpResponse.json(body));

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const confirmDelete = async (onSuccess: () => void) => {
  const user = userEvent.setup();
  render(<DeleteSourceModal source="okta" onSuccess={onSuccess} />, {
    wrapper,
  });
  await user.click(
    await screen.findByRole(
      'button',
      { name: 'Delete okta' },
      { timeout: 5000 },
    ),
  );
  await user.click(await screen.findByRole('button', { name: 'Delete' }));
};

describe('DeleteSourceModal', () => {
  it('tells the operator the delete awaits review and leaves the source selected', async () => {
    server.use(
      answer({
        source: 'okta',
        message: 'deleted',
        review_required: true,
        pr_url: PR,
        review_branch: 'dfe/review/okta',
      }),
    );
    const onSuccess = vi.fn();

    await confirmDelete(onSuccess);

    expect(
      await screen.findByText(
        'Delete of okta awaiting review',
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/stays in the list/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the review request' }),
    ).toHaveAttribute('href', PR);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('hands over to the caller when the delete went through', async () => {
    server.use(
      answer({ source: 'okta', message: 'deleted', review_required: false }),
    );
    const onSuccess = vi.fn();

    await confirmDelete(onSuccess);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce(), {
      timeout: 5000,
    });
    expect(screen.queryByText(/awaiting review/)).toBeNull();
  });
});
