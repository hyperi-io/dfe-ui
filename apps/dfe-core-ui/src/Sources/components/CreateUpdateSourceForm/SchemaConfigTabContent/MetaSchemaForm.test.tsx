import { Form } from '@/core/components/Form';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, FormRule } from 'antd';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { MetaSchemaForm } from './MetaSchemaForm';
import { resetSystemDefaultsStore, server } from './MetaSchemaForm.mocks';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/sources',
}));

// CreateSchemaDrawer transitively loads AceEditor, which needs a global `ace` ClientContext sets.
vi.mock('@/core/components/CreateSchemaDrawer', () => ({
  CreateSchemaDrawer: () => null,
}));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetSystemDefaultsStore();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

// The zod rules are not under test here, so every field accepts what it holds.
const acceptAll: FormRule = { validator: async () => undefined };

const Harness = ({
  onFinish,
  initialValues,
}: {
  onFinish: (values: CreateUpdateSourceFormData) => void;
  initialValues?: Partial<CreateUpdateSourceFormData>;
}) => {
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  return (
    <Form form={form} onFinish={onFinish} initialValues={initialValues}>
      <MetaSchemaForm formValidation={acceptAll} form={form} />
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
};

describe('MetaSchemaForm TTL Days', () => {
  it('populates a new source with the DFE default', async () => {
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    const ttl = await screen.findByLabelText(
      /^TTL Days/,
      {},
      { timeout: 15000 },
    );
    await waitFor(() => expect(ttl).toHaveValue('90'), { timeout: 15000 });
    expect(screen.queryByText('Override')).not.toBeInTheDocument();
  });

  it('marks a value the source sets as an override', async () => {
    render(
      <Harness
        onFinish={vi.fn()}
        initialValues={{
          schema: {
            meta_schema: 'meta/string',
            meta_schema_version: '1',
            ttl_days: 7,
            engine: '',
          },
        }}
      />,
      { wrapper },
    );

    const ttl = await screen.findByLabelText(
      /^TTL Days/,
      {},
      { timeout: 15000 },
    );
    expect(ttl).toHaveValue('7');
    expect(screen.getAllByText('Override')).toHaveLength(1);
  });

  it('keeps 0 as an override that means no TTL', async () => {
    render(
      <Harness
        onFinish={vi.fn()}
        initialValues={{
          schema: {
            meta_schema: 'meta/string',
            meta_schema_version: '1',
            ttl_days: 0,
            engine: '',
          },
        }}
      />,
      { wrapper },
    );

    const ttl = await screen.findByLabelText(
      /^TTL Days/,
      {},
      { timeout: 15000 },
    );
    expect(ttl).toHaveValue('0');
    expect(screen.getAllByText('Override')).toHaveLength(1);
    expect(
      screen.getByText('Whole days. 0 keeps data forever with no TTL.'),
    ).toBeInTheDocument();
  });

  it('submits null, not 0, when the box is cleared', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        initialValues={{
          schema: {
            meta_schema: 'meta/string',
            meta_schema_version: '1',
            ttl_days: 7,
            engine: '',
          },
        }}
      />,
      { wrapper },
    );

    const ttl = await screen.findByLabelText(
      /^TTL Days/,
      {},
      { timeout: 15000 },
    );
    await waitFor(() => expect(ttl).toHaveValue('7'), { timeout: 15000 });
    await user.clear(ttl);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1), {
      timeout: 15000,
    });
    const submitted = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
    expect(submitted.schema?.ttl_days).toBeNull();
  });
});

const withSchema = (engine: string) => ({
  schema: {
    meta_schema: 'meta/string',
    meta_schema_version: '1',
    engine,
  },
});

describe('MetaSchemaForm Engine', () => {
  it('populates a new source with the DFE default', async () => {
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    await waitFor(
      () => expect(screen.getByText('MergeTree')).toBeInTheDocument(),
      { timeout: 15000 },
    );
    expect(screen.queryByText('Override')).not.toBeInTheDocument();
  });

  it('offers the registry engines and marks a picked one as an override', async () => {
    const user = userEvent.setup();
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    const engine = await screen.findByLabelText(
      /^Engine/,
      {},
      { timeout: 15000 },
    );
    await user.click(engine);
    await user.click(
      await screen.findByTitle(
        'Keeps the latest row per sorting key.',
        {},
        { timeout: 15000 },
      ),
    );

    expect(await screen.findByText('Override')).toBeInTheDocument();
  });

  it('shows the arguments box for a variant that takes them and submits the composed engine', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        initialValues={withSchema('ReplacingMergeTree')}
      />,
      { wrapper },
    );

    const args = await screen.findByLabelText(
      'ReplacingMergeTree arguments',
      {},
      { timeout: 15000 },
    );
    expect(args).toHaveAttribute(
      'placeholder',
      'version_column[, is_deleted_column] (optional)',
    );
    await user.type(args, 'updated_at');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1), {
      timeout: 15000,
    });
    const submitted = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
    expect(submitted.schema?.engine).toBe('ReplacingMergeTree(updated_at)');
  });

  it('refuses a variant whose required arguments are missing', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        initialValues={withSchema('CollapsingMergeTree')}
      />,
      { wrapper },
    );

    await screen.findByLabelText(
      'CollapsingMergeTree arguments',
      {},
      { timeout: 15000 },
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText(
        'CollapsingMergeTree requires arguments: sign_column',
        {},
        { timeout: 15000 },
      ),
    ).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('keeps stored arguments editable on a variant that takes none', async () => {
    render(
      <Harness onFinish={vi.fn()} initialValues={withSchema('MergeTree(x)')} />,
      { wrapper },
    );

    const args = await screen.findByLabelText(
      'MergeTree arguments',
      {},
      { timeout: 15000 },
    );
    expect(args).toHaveValue('x');
  });

  it('falls back to free text when the engine offers no registry', async () => {
    server.use(
      API_CONFIG_MOCKS.sources.engines.get.success({
        mockedResponse: {
          items: [],
          total: 0,
          page: 1,
          per_page: 100,
          total_pages: 0,
          next_page: null,
          prev_page: null,
        },
      }),
    );
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} />, { wrapper });

    // Re-query inside waitFor: the control mounts as a Select while engines load,
    // then swaps to a free-text Input when the registry is empty.
    await waitFor(
      () => expect(screen.getByLabelText(/^Engine/)).toHaveValue('MergeTree'),
      { timeout: 15000 },
    );
    const engine = screen.getByLabelText(/^Engine/);
    await user.clear(engine);
    await user.type(engine, 'ReplacingMergeTree(ver)');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1), {
      timeout: 15000,
    });
    const submitted = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
    expect(submitted.schema?.engine).toBe('ReplacingMergeTree(ver)');
  });
});
