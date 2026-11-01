import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { SourceDetailsProvider } from '@/Sources/contexts/SourceDetailsContext';
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
import { EditSourceDrawer } from '.';
import { PR_URL, saveAnswer, server } from './EditSourceDrawer.mocks';

const { router } = vi.hoisted(() => ({ router: { replace: vi.fn() } }));

// The list provider picks the edited source and version off the URL.
vi.mock('next/navigation', () => {
  const searchParams = new URLSearchParams(
    'source_name=shared-probe&source_version=1.0.0',
  );
  return {
    useRouter: () => router,
    useSearchParams: () => searchParams,
    usePathname: () => '/sources',
  };
});

// Ace needs a real browser and the fetcher config editor is off this form's path.
vi.mock('@/core/components/AceEditor', () => ({ AceEditor: () => null }));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  router.replace.mockClear();
  server.resetHandlers();
  saveAnswer.heldForReview = true;
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withListSourcesProvider({})
  .withWrapper(({ children }) => (
    <SourceDetailsProvider>{children}</SourceDetailsProvider>
  ));

const saveSource = async (onSuccess: () => void) => {
  const user = userEvent.setup();
  render(<EditSourceDrawer open onSuccess={onSuccess} />, { wrapper });
  await user.click(
    await screen.findByRole(
      'button',
      { name: 'Update Source' },
      { timeout: 15_000 },
    ),
  );
};

describe('EditSourceDrawer', () => {
  it('says the changes await review and does not report them as updated', async () => {
    const onSuccess = vi.fn();

    await saveSource(onSuccess);

    expect(
      await screen.findByText(
        'shared-probe changes awaiting review',
        {},
        { timeout: 10_000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the review request' }),
    ).toHaveAttribute('href', PR_URL);
    expect(screen.queryByText(/updated successfully/)).toBeNull();
    expect(onSuccess).not.toHaveBeenCalled();
    // The held version is not on main yet, so the page stays on the one it shows.
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('reports the update and hands over when it was applied', async () => {
    saveAnswer.heldForReview = false;
    const onSuccess = vi.fn();

    await saveSource(onSuccess);

    expect(
      await screen.findByText(
        'shared-probe updated successfully',
        {},
        { timeout: 10_000 },
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});
