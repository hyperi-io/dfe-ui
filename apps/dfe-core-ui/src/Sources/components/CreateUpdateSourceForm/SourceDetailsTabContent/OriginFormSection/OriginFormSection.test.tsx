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
import { OriginFormSection } from '.';
import { server } from './OriginFormSection.mocks';

// Ace needs a real browser; the origin switch under test does not.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange?: (next: string) => void;
  }) => (
    <textarea
      aria-label="Config"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

// The zod rules have their own tests; every field accepts what it holds here.
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
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        origin: 'receiver',
        match: { field: '', operator: 'equals', value: '' },
        fetcher: { source_type: '', topic: 'own', config: '' },
        receiver_ui_config: { table: 'main' },
        ...initialValues,
      }}
    >
      <OriginFormSection formValidation={acceptAll} form={form} />
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
};

describe('OriginFormSection', () => {
  it('opens on the receiver match fields', async () => {
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    expect(await screen.findByLabelText(/^Field/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Source type')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Shared table' })).toBeChecked();
  });

  it('swaps the match fields for the fetcher fields', async () => {
    const user = userEvent.setup();
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    await user.click(await screen.findByRole('radio', { name: 'Fetcher' }));

    expect(await screen.findByLabelText('Source type')).toBeInTheDocument();
    expect(await screen.findByLabelText('Config')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Field/)).not.toBeInTheDocument();
  });

  it('offers the source families the manifest declares', async () => {
    const user = userEvent.setup();
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    await user.click(await screen.findByRole('radio', { name: 'Fetcher' }));
    await user.click(await screen.findByLabelText('Source type'));

    expect(await screen.findByTitle('crates_io')).toBeInTheDocument();
    expect(await screen.findByTitle('okta')).toBeInTheDocument();
  });

  it('leaves the match rule empty after a trip through the fetcher', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onFinish={vi.fn()}
        initialValues={{
          match: { field: '_json.app', operator: 'equals', value: 'kv-proof' },
        }}
      />,
      { wrapper },
    );

    expect(await screen.findByLabelText(/^Field/)).toHaveValue('_json.app');
    await user.click(screen.getByRole('radio', { name: 'Fetcher' }));
    await user.click(await screen.findByRole('radio', { name: 'Receiver' }));

    expect(await screen.findByLabelText(/^Field/)).toHaveValue('');
    expect(screen.getByLabelText(/^Value/)).toHaveValue('');
  });

  it('leaves the fetcher stanza empty after a trip through the receiver', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onFinish={vi.fn()}
        initialValues={{
          origin: 'fetcher',
          fetcher: {
            source_type: 'crates_io',
            topic: 'main',
            config: 'crates:\n  - dfe-fetcher\n',
          },
        }}
      />,
      { wrapper },
    );

    expect(await screen.findByLabelText('Config')).toHaveValue(
      'crates:\n  - dfe-fetcher\n',
    );
    await user.click(screen.getByRole('radio', { name: 'Receiver' }));
    await user.click(await screen.findByRole('radio', { name: 'Fetcher' }));

    expect(await screen.findByLabelText('Config')).toHaveValue('');
  });

  it('submits the selected origin block and not the other one', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        initialValues={{
          match: { field: '_json.app', operator: 'equals', value: 'kv-proof' },
        }}
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    const asReceiver = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
    expect(asReceiver.origin).toBe('receiver');
    expect(asReceiver.match?.field).toBe('_json.app');
    expect(asReceiver.fetcher).toBeUndefined();

    await user.click(await screen.findByRole('radio', { name: 'Fetcher' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(2));
    const asFetcher = onFinish.mock.calls[1][0] as CreateUpdateSourceFormData;
    expect(asFetcher.origin).toBe('fetcher');
    expect(asFetcher.fetcher?.topic).toBe('own');
    expect(asFetcher.match).toBeUndefined();
  });
});
