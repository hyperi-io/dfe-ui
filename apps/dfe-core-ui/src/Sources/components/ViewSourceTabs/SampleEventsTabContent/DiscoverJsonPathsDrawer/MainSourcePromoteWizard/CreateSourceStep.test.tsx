import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
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
import { CreateSourceStep } from './CreateSourceStep';

// The real form loads the Ace editor, which needs a browser. A button that
// submits a minimal source stands in for it.
vi.mock('@/Sources/components/CreateUpdateSourceForm', () => ({
  CreateUpdateSourceForm: ({
    onFinish,
  }: {
    onFinish: (values: unknown) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onFinish({
          origin: 'receiver',
          source: 'newsrc',
          enabled: true,
          archive: false,
          match: { field: 'f', operator: 'equals', value: 'v' },
        })
      }
    >
      Submit source
    </button>
  ),
}));

const PR = 'https://github.com/acme/deploy/pull/7';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withWrapper(({ children }) => <App>{children}</App>);

const answer = (held: boolean) =>
  server.use(
    http.post('/api/v1/sources', () =>
      HttpResponse.json(
        {
          source: 'newsrc',
          message: 'created',
          current: '1.0.0',
          versions: ['1.0.0'],
          review_required: held,
          ...(held && { pr_url: PR }),
        },
        { status: held ? 202 : 201 },
      ),
    ),
  );

const submit = async (onSuccess: () => void) => {
  const user = userEvent.setup();
  render(<CreateSourceStep schemaPath="meta/okta" onSuccess={onSuccess} />, {
    wrapper,
  });
  await user.click(screen.getByRole('button', { name: 'Submit source' }));
};

describe('CreateSourceStep', () => {
  it('stays on this step and links the review when the source is held', async () => {
    answer(true);
    const onSuccess = vi.fn();

    await submit(onSuccess);

    expect(
      await screen.findByText('newsrc awaiting review'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the review request' }),
    ).toHaveAttribute('href', PR);
    expect(screen.queryByRole('button', { name: 'Submit source' })).toBeNull();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('moves the wizard on when the source was created', async () => {
    answer(false);
    const onSuccess = vi.fn();

    await submit(onSuccess);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});
