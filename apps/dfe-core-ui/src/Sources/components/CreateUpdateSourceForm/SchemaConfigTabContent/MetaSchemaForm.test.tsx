import { Form } from '@/core/components/Form';
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
import { server } from './MetaSchemaForm.mocks';

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
afterEach(() => server.resetHandlers());
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
  it('leaves a new source blank, with the DFE default as the placeholder', async () => {
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    const ttl = await screen.findByLabelText(
      /^TTL Days/,
      {},
      { timeout: 15000 },
    );
    await waitFor(
      () => expect(ttl).toHaveAttribute('placeholder', '90 (DFE default)'),
      { timeout: 15000 },
    );
    expect(ttl).toHaveValue('');
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

describe('MetaSchemaForm Engine', () => {
  it('leaves a new source blank, with the DFE default as the placeholder', async () => {
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    const engine = await screen.findByLabelText(
      /^Engine/,
      {},
      { timeout: 15000 },
    );
    await waitFor(
      () =>
        expect(engine).toHaveAttribute(
          'placeholder',
          'MergeTree (DFE default)',
        ),
      { timeout: 15000 },
    );
    expect(engine).toHaveValue('');
  });

  it('marks a typed engine as an override', async () => {
    const user = userEvent.setup();
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    const engine = await screen.findByLabelText(
      /^Engine/,
      {},
      { timeout: 15000 },
    );
    await user.type(engine, 'ReplacingMergeTree');

    expect(await screen.findByText('Override')).toBeInTheDocument();
  });
});
