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
import { ownTableHandlers, server } from './CreateUpdateSourceForm.mocks';
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

describe('CreateUpdateSourceForm archive', () => {
  // Its backstops (15s to render the name field, 10s to submit) outlast the 20s default.
  it(
    'carries an archive decision through a fresh create',
    { timeout: 45_000 },
    async () => {
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
      expect(transformSourceFormDataToRequestBody(submitted).archive).toBe(
        false,
      );
    },
  );
});

describe('CreateUpdateSourceForm views', () => {
  const storedViews = [
    { standard: 'sigma', taxonomy: 'windows' },
    { standard: 'ecs', field_map: 'ecs/shared-probe' },
  ];

  // Its backstops (15s to render the name field, 10s to submit) outlast the 20s default.
  it(
    'keeps the views of a source whose Views tab is hidden',
    { timeout: 45_000 },
    async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      render(
        <CreateUpdateSourceForm
          onFinish={onFinish}
          isPending={false}
          error={null}
          buttonLabel="Update Source"
          initialValues={{
            source: 'shared-probe',
            enabled: true,
            archive: false,
            origin: 'receiver',
            match: {
              field: 'data_stream.dataset',
              operator: 'equals',
              value: 'probe.log',
            },
            receiver_ui_config: { table: 'main' },
            views: storedViews,
          }}
        />,
        { wrapper },
      );

      await screen.findByLabelText(/^Source Name/, {}, { timeout: 15_000 });
      expect(
        screen.queryByRole('tab', { name: 'Views' }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Update Source' }));

      await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1), {
        timeout: 10_000,
      });
      const submitted = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
      // The engine's update replaces the version, so a body without views clears them.
      expect(transformSourceFormDataToRequestBody(submitted).views).toEqual(
        storedViews,
      );
    },
  );
});

describe('CreateUpdateSourceForm meta schema', () => {
  // Its backstops (15s to render the own-topic tabs, 10s to refuse) outlast the 20s default.
  it(
    'stops a clone of an own-topic fetcher with no meta schema, as a create stops',
    { timeout: 45_000 },
    async () => {
      server.use(...ownTableHandlers);
      const user = userEvent.setup();
      const onFinish = vi.fn();
      // What the clone drawer seeds from a source saved with no meta schema.
      render(
        <CreateUpdateSourceForm
          onFinish={onFinish}
          isPending={false}
          error={null}
          buttonLabel="Clone Source"
          initialValues={{
            source: 'legacyfetch-copy',
            enabled: true,
            archive: false,
            origin: 'fetcher',
            fetcher: { source_type: 'crates_io', topic: 'own', config: '' },
            schema: { meta_schema: '', meta_schema_version: '' },
          }}
        />,
        { wrapper },
      );

      await screen.findByRole(
        'tab',
        { name: /Table Settings/ },
        { timeout: 15_000 },
      );
      await user.click(screen.getByRole('button', { name: 'Clone Source' }));

      expect(
        await screen.findByText(
          /validation errors in the following tabs: Table Settings/,
          {},
          { timeout: 10_000 },
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('Meta schema is required')).toBeInTheDocument();
      expect(onFinish).not.toHaveBeenCalled();
    },
  );
});

describe('CreateUpdateSourceForm transform', () => {
  // Its two backstops (15s to render the own-table tabs, 10s to submit) outlast the 20s default.
  it(
    'sends a clear when No Transform replaces a stored transform',
    {
      timeout: 45_000,
    },
    async () => {
      server.use(...ownTableHandlers);
      const user = userEvent.setup();
      const onFinish = vi.fn();
      render(
        <CreateUpdateSourceForm
          onFinish={onFinish}
          isPending={false}
          error={null}
          buttonLabel="Update Source"
          initialValues={{
            source: 'own-probe',
            enabled: true,
            archive: false,
            origin: 'receiver',
            match: {
              field: 'data_stream.dataset',
              operator: 'equals',
              value: 'probe.log',
            },
            receiver_ui_config: { table: 'own' },
            header: { type: 'common-header/timeseries', version: '1.0.0' },
            schema: {
              meta_schema: 'meta/aws/cloudtrail',
              meta_schema_version: '1.0.0',
              engine: '',
            },
            transform: { engine: 'vrl' },
          }}
        />,
        { wrapper },
      );

      await user.click(
        await screen.findByRole(
          'tab',
          { name: 'Transform' },
          { timeout: 15_000 },
        ),
      );
      await user.click(screen.getByRole('radio', { name: 'No Transform' }));
      expect(
        screen.queryByLabelText(/^Transform Engine/),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Update Source' }));

      await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1), {
        timeout: 10_000,
      });
      const submitted = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
      // The engine keeps a transform the body leaves out.
      expect(transformSourceFormDataToRequestBody(submitted)).toHaveProperty(
        'transform',
        null,
      );
    },
  );
});
