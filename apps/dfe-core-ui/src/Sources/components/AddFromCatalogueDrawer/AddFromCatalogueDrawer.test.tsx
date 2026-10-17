import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { http, HttpResponse } from 'msw';
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

// jsdom has no IntersectionObserver, and the catalogue and the list behind the
// drawer both page on one, so each instance keeps what it watches.
const observers: MockIntersectionObserver[] = [];
class MockIntersectionObserver {
  targets: Element[] = [];
  constructor(readonly callback: IntersectionObserverCallback) {
    observers.push(this);
  }
  observe = (target: Element) => {
    this.targets.push(target);
  };
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

/** Scroll the catalogue's load-more row into view, as a tall window shows it unscrolled. */
const revealLoadMore = () => {
  const latest = [...observers]
    .reverse()
    .find((observer) =>
      observer.targets.some((target) => target.closest('.ant-table')),
    );
  if (!latest) throw new Error('nothing in the catalogue table is observed');
  act(() =>
    latest.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      latest as unknown as IntersectionObserver,
    ),
  );
};

const ENTRIES = Array.from({ length: 53 }, (_, index) => {
  const stream = `stream_${String(index).padStart(2, '0')}`;
  return {
    name: `aws_${stream}`,
    package: 'aws',
    data_stream: stream,
    dataset: `aws.${stream}`,
    intakes: ['beats', 'fetcher'],
    framing: null,
    transforms: ['default'],
    beats: { module: 'aws', fileset: stream },
    source: `aws_${stream}`,
  };
});

/** The engine's paging over 53 entries: 20 a page unless asked otherwise. */
const pagedCatalogue = http.get(
  API_CONFIG_MOCKS.sources.catalogue.mockedUrl,
  ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const perPage = Number(url.searchParams.get('per_page') ?? 20);
    const totalPages = Math.ceil(ENTRIES.length / perPage);
    return HttpResponse.json({
      items: ENTRIES.slice((page - 1) * perPage, page * perPage),
      total: ENTRIES.length,
      page,
      per_page: perPage,
      total_pages: totalPages,
      next_page: page < totalPages ? page + 1 : null,
      prev_page: page > 1 ? page - 1 : null,
    });
  },
);

const refuseCatalogueCreate = (body: object) =>
  http.post(
    API_CONFIG_MOCKS.sources.fromCatalogue.mockedUrl.replace('{entry}', 'okta'),
    () => HttpResponse.json(body, { status: 422 }),
  );

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withListSourcesProvider()
  // Success is an App notification. Without the holder it never mounts.
  .withWrapper(({ children }) => <App>{children}</App>);

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

    await user.click(screen.getByRole('button', { name: 'Select okta' }));

    // The CI runner renders the selection under load; the suite's component
    // tests bound their waits at 15 s for the same reason.
    await user.click(await screen.findByLabelText('Intake for this source'));
    await user.click(await screen.findByTitle('Beats'));
    await user.type(screen.getByLabelText(/^Source Name/), 'okta');

    await user.click(await screen.findByRole('button', { name: 'Add' }));

    expect(
      await screen.findByText(
        'Source okta created from the catalogue',
        {},
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
  });

  it('reaches every entry a search matches, even when one page fills no scroll', async () => {
    server.use(pagedCatalogue);
    const user = userEvent.setup();
    render(<AddFromCatalogueDrawer />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: /Add from catalogue/ }),
    );
    expect(
      await screen.findByText('20 of 53 entries shown'),
    ).toBeInTheDocument();

    revealLoadMore();
    expect(
      await screen.findByText('40 of 53 entries shown'),
    ).toBeInTheDocument();

    revealLoadMore();
    expect(
      await screen.findByText('53 of 53 entries shown'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Select aws_stream_52' }),
    ).toBeInTheDocument();
  });

  it('pins the entry name and its Select, so a wide row scrolls only what is between', async () => {
    const user = userEvent.setup();
    render(<AddFromCatalogueDrawer />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: /Add from catalogue/ }),
    );
    const select = await screen.findByRole('button', { name: 'Select okta' });

    // jsdom lays nothing out, so the pin is read off the cells antd marks sticky.
    expect(select.closest('td')).toHaveClass('ant-table-cell-fix-end');
    expect(screen.getByText('okta').closest('td')).toHaveClass(
      'ant-table-cell-fix-start',
    );
  });

  it('describes the chosen entry in words, not raw values', async () => {
    const user = userEvent.setup();
    render(<AddFromCatalogueDrawer />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: /Add from catalogue/ }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Select okta' }),
    );

    expect(
      await screen.findByText('Beats, Pulled by a fetcher'),
    ).toBeInTheDocument();
    expect(screen.getByText('Beats module')).toBeInTheDocument();
    expect(screen.getByText('Beats fileset')).toBeInTheDocument();
    expect(screen.queryByText(/"module"/)).not.toBeInTheDocument();
  });

  it('shows each field the engine refused, not only its count', async () => {
    server.use(
      refuseCatalogueCreate({
        code: 'validation_error',
        message: '1 validation error(s)',
        errors: [
          {
            field: 'name',
            message: 'String should match the source name rule',
            code: 'string_pattern_mismatch',
          },
        ],
      }),
    );
    const user = userEvent.setup();
    render(<AddFromCatalogueDrawer />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: /Add from catalogue/ }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Select okta' }),
    );
    await user.click(await screen.findByLabelText('Intake for this source'));
    await user.click(await screen.findByTitle('Beats'));
    await user.type(screen.getByLabelText(/^Source Name/), 'okta');
    await user.click(await screen.findByRole('button', { name: 'Add' }));

    expect(
      await screen.findByText('name: String should match the source name rule'),
    ).toBeInTheDocument();
  });

  it('shows the engine refusing an own-topic fetcher with no schema, word for word', async () => {
    const refusal =
      "source 'okta': a fetcher on its own topic needs a schema or it can never be deployed. Set the fetcher topic to 'main' to land on the shared table, or define a schema (meta_schema, derived_schema or additional_fields)";
    server.use(
      refuseCatalogueCreate({ code: 'validation_error', message: refusal }),
    );
    const user = userEvent.setup();
    render(<AddFromCatalogueDrawer />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: /Add from catalogue/ }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Select okta' }),
    );
    await user.click(await screen.findByLabelText('Intake for this source'));
    await user.click(await screen.findByTitle('Pulled by a fetcher'));
    await user.type(screen.getByLabelText(/^Source Name/), 'okta');
    await user.click(await screen.findByRole('button', { name: 'Add' }));

    expect(await screen.findByText(refusal)).toBeInTheDocument();
  });
});
