import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { CreateUpdateSourceForm } from '.';
import { server } from './CreateUpdateSourceForm.mocks';
import { CreateUpdateSourceFormData } from './sourceForm.schema';

// The field-maps provider behind the form reads the URL to keep filters
// shareable, and re-runs on the search params' identity, so these stay stable.
vi.mock('next/navigation', () => {
  const searchParams = new URLSearchParams();
  const router = { replace: vi.fn() };
  return {
    useRouter: () => router,
    useSearchParams: () => searchParams,
    usePathname: () => '/sources',
  };
});

// Ace needs a real browser; the fetcher config editor is off this form's path.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

// jsdom has no IntersectionObserver; the field-maps list pages on one.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateUpdateSourceForm assign schema', () => {
  it('selects main on an empty form', async () => {
    const user = userEvent.setup();
    render(
      <CreateUpdateSourceForm
        onFinish={vi.fn()}
        isPending={false}
        error={null}
      />,
      { wrapper },
    );

    await user.click(
      await screen.findByRole('tab', { name: 'Table Settings' }),
    );

    expect(screen.getByRole('radio', { name: 'main' })).toBeChecked();
  });
});

describe('CreateUpdateSourceForm archive', () => {
  it('carries an archive decision through a fresh create', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <CreateUpdateSourceForm
        onFinish={onFinish}
        isPending={false}
        error={null}
      />,
      { wrapper },
    );

    await user.type(
      await screen.findByLabelText(/^Source Name/, {}, { timeout: 15_000 }),
      'crates-audit',
    );
    await user.type(screen.getByLabelText(/^Field/), '_json.app');
    await user.type(screen.getByLabelText(/^Value/), 'kv-proof');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1), {
      timeout: 10_000,
    });
    const submitted = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
    expect(submitted.archive).toBe(false);
    // The drawer sends whatever this returns, so the field reaches the engine.
    expect(transformSourceFormDataToRequestBody(submitted).archive).toBe(false);
  });
});
