import { OKTA_CATALOGUE_ENTRY } from '@/core/config/api/endpoints/generator/mocks/sources';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  COREDNS_CATALOGUE_ENTRY,
  MISSING_VARIANT_REASON,
  recordCatalogueCreates,
  refuseCatalogueCreate,
  server,
} from '@/Sources/components/AddFromCatalogueDrawer/AddFromCatalogueDrawer.mocks';
import { TSourceCatalogueItem } from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { App } from 'antd';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AddFromCatalogueForm } from './AddFromCatalogueForm';

// The sources list context reads the URL to keep its filters shareable.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/sources',
}));

// jsdom has no IntersectionObserver, and the sources list context pages on one.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const UNKNOWN_REASON =
  "no 'dfe-transform-elastic' contract is mounted, so its variants are not known";

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withListSourcesProvider()
  // Success is an App notification. Without the holder it never mounts.
  .withWrapper(({ children }) => <App>{children}</App>);

const renderForm = (entry: TSourceCatalogueItem) =>
  render(<AddFromCatalogueForm entry={entry} />, { wrapper });

/** Pick an option out of an antd select by the select's accessible name. */
const choose = async (user: UserEvent, select: string, option: string) => {
  await user.click(await screen.findByLabelText(select));
  await user.click(await screen.findByTitle(option));
};

/** Submit and wait out the success notification, which a loaded runner renders late. */
const addAndAwaitSuccess = async (user: UserEvent, source: string) => {
  await user.click(screen.getByRole('button', { name: 'Add' }));
  expect(
    await screen.findByText(
      `Source ${source} created from the catalogue`,
      {},
      { timeout: 15_000 },
    ),
  ).toBeInTheDocument();
};

describe('AddFromCatalogueForm', () => {
  it('describes the entry in words, not raw values', async () => {
    renderForm(OKTA_CATALOGUE_ENTRY);

    expect(
      await screen.findByText('Beats, Pulled by a fetcher'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The system data stream of the Elastic okta integration.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Okta system log')).toBeInTheDocument();
    expect(screen.getByText('filebeat.okta.default')).toBeInTheDocument();
    expect(screen.getByText('Bound')).toBeInTheDocument();
    expect(screen.getByText('Beats module')).toBeInTheDocument();
    expect(screen.getByText('Beats fileset')).toBeInTheDocument();
    expect(screen.queryByText(/"module"/)).not.toBeInTheDocument();
  });

  it('offers only the intakes the entry lists, starting on its default', async () => {
    const user = userEvent.setup();
    renderForm(OKTA_CATALOGUE_ENTRY);

    const intake = await screen.findByLabelText('Intake for this source');
    expect(intake.closest('.ant-select')).toHaveTextContent(
      'Pulled by a fetcher',
    );
    await user.click(intake);
    expect(await screen.findByTitle('Beats')).toBeInTheDocument();
    expect(screen.queryByTitle('Pushed to the receiver')).toBeNull();
  });

  it('sends no choice the user left at its default', async () => {
    const { bodies, handler } = recordCatalogueCreates('okta');
    server.use(handler);
    const user = userEvent.setup();
    renderForm(OKTA_CATALOGUE_ENTRY);

    await screen.findByLabelText('Intake for this source');
    await addAndAwaitSuccess(user, 'okta');

    // The generated body type requires archive, so it is always sent.
    expect(bodies).toEqual([{ archive: false }]);
  });

  it('sends the intake, name and archive the user chose', async () => {
    const { bodies, handler } = recordCatalogueCreates('okta');
    server.use(handler);
    const user = userEvent.setup();
    renderForm(OKTA_CATALOGUE_ENTRY);

    await choose(user, 'Intake for this source', 'Beats');
    const name = screen.getByLabelText(/^Source Name/);
    expect(name).toHaveValue('okta');
    await user.clear(name);
    await user.type(name, 'okta-prod');
    await user.click(screen.getByRole('switch', { name: 'Archive' }));
    await addAndAwaitSuccess(user, 'okta');

    expect(bodies).toEqual([
      { intake: 'beats', name: 'okta-prod', archive: true },
    ]);
  });

  it('offers no variant choice when the entry compiles to one', async () => {
    renderForm(OKTA_CATALOGUE_ENTRY);

    expect(
      await screen.findByLabelText('Intake for this source'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Variant for this source')).toBeNull();
  });

  it('sends the variant the user chose over the default', async () => {
    const { bodies, handler } = recordCatalogueCreates('coredns-log');
    server.use(handler);
    const user = userEvent.setup();
    renderForm(COREDNS_CATALOGUE_ENTRY);

    const variant = await screen.findByLabelText('Variant for this source');
    expect(variant.closest('.ant-select')).toHaveTextContent(
      'filebeat.coredns_log.default',
    );
    await choose(user, 'Variant for this source', 'filebeat.coredns_log.json');
    await addAndAwaitSuccess(user, 'coredns-log');

    expect(bodies).toEqual([
      { variant: 'filebeat.coredns_log.json', archive: false },
    ]);
  });

  it('holds back a create the deployed transform would refuse, and says why', async () => {
    const user = userEvent.setup();
    renderForm({
      ...COREDNS_CATALOGUE_ENTRY,
      availability: 'missing_variant',
      availability_reason: MISSING_VARIANT_REASON,
    });

    expect(await screen.findByText(MISSING_VARIANT_REASON)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

    // Only the default variant was judged, so another one is left to the engine.
    await choose(user, 'Variant for this source', 'filebeat.coredns_log.json');
    expect(screen.queryByText(MISSING_VARIANT_REASON)).toBeNull();
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });

  it('lets a create through when the variant could not be checked, with a note', async () => {
    renderForm({
      ...OKTA_CATALOGUE_ENTRY,
      availability: 'unknown',
      availability_reason: UNKNOWN_REASON,
    });

    expect(await screen.findByText(UNKNOWN_REASON)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });

  it('shows the engine refusing a variant the deployed transform lacks, word for word', async () => {
    const refusal =
      "the deployed 'dfe-transform-elastic' does not ship transform variant 'filebeat.okta.default'";
    server.use(
      refuseCatalogueCreate(
        {
          code: 'missing_variant',
          message: refusal,
          context: {
            transform: 'dfe-transform-elastic',
            variant: 'filebeat.okta.default',
          },
        },
        409,
      ),
    );
    const user = userEvent.setup();
    renderForm(OKTA_CATALOGUE_ENTRY);

    await user.click(await screen.findByRole('button', { name: 'Add' }));

    expect(
      await screen.findByText(refusal, {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
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
    renderForm(OKTA_CATALOGUE_ENTRY);

    await user.click(await screen.findByRole('button', { name: 'Add' }));

    expect(
      await screen.findByText(
        'name: String should match the source name rule',
        {},
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
  });

  it('shows the engine refusing an own-topic fetcher with no schema, word for word', async () => {
    const refusal =
      "source 'okta': a fetcher on its own topic needs a schema or it can never be deployed. Set its Topic to 'Shared table', or give it a Meta Schema";
    server.use(
      refuseCatalogueCreate({ code: 'validation_error', message: refusal }),
    );
    const user = userEvent.setup();
    renderForm(OKTA_CATALOGUE_ENTRY);

    await user.click(await screen.findByRole('button', { name: 'Add' }));

    expect(
      await screen.findByText(refusal, {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
  });
});
