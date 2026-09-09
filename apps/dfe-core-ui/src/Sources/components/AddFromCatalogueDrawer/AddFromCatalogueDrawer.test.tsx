import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
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
import { AddFromCatalogueDrawer } from '.';
import { server } from './AddFromCatalogueDrawer.mocks';

// The sources list context reads the URL to keep its filters shareable.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/sources',
}));

// jsdom has no IntersectionObserver; the list behind the drawer pages on one.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withListSourcesProvider({});

describe('AddFromCatalogueDrawer', () => {
  it('lists what the catalogue offers and creates the source from an entry', async () => {
    const user = userEvent.setup();
    render(<AddFromCatalogueDrawer />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: /Add from catalogue/ }),
    );

    // The entry, the dataset the receiver matches on, and the intakes it offers.
    expect(await screen.findByText('okta.system')).toBeInTheDocument();
    expect(screen.getByText('Beats')).toBeInTheDocument();
    expect(screen.getByText('Pulled by a fetcher')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Select' }));

    const add = await screen.findByRole('button', { name: /Add okta/ });
    await user.click(add);

    await waitFor(() =>
      expect(
        screen.getByText('Source okta created from the catalogue'),
      ).toBeInTheDocument(),
    );
  });
});
