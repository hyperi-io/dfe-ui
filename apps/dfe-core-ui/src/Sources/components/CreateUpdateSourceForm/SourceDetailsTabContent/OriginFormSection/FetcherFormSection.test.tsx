import { Form } from '@/core/components/Form';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  CreateUpdateSourceFormData,
  formSchema,
} from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Input } from 'antd';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { FetcherFormSection } from './FetcherFormSection';
import { server } from './OriginFormSection.mocks';

// Ace needs a real browser; the error under test is the form's, not the editor's.
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

const SOURCE_TYPE_HINT =
  'No fetcher is deployed, so there are no source types to pick from';
const CONFIG_HINT =
  "The fetcher's own YAML stanza. Credentials must be env: or vault: references, never literals.";

/**
 * The real source schema, with the top-level fields its other tabs own held
 * valid. The cross-field fetcher rules only run once the rest of the object
 * parses, and `getFieldsValue` only returns fields something has registered.
 */
const HELD_VALID: Partial<CreateUpdateSourceFormData> = {
  source: 'crates-audit',
  enabled: true,
  archive: false,
  origin: 'fetcher',
};

const Harness = ({
  fetcher,
  onFinish = vi.fn(),
}: {
  fetcher: NonNullable<CreateUpdateSourceFormData['fetcher']>;
  onFinish?: (values: CreateUpdateSourceFormData) => void;
}) => {
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateSourceFormData>(formSchema);
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ ...HELD_VALID, fetcher }}
    >
      {Object.keys(HELD_VALID).map((name) => (
        <Form.Item key={name} name={name} hidden>
          <Input type="hidden" />
        </Form.Item>
      ))}
      <FetcherFormSection formValidation={formValidation} />
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
};

describe('FetcherFormSection errors', () => {
  it('shows the source type error beside the hint when no fetcher is deployed', async () => {
    const user = userEvent.setup();
    server.use(
      API_CONFIG_MOCKS.apps.default.get.success({ mockedResponse: [] }),
    );
    render(
      <Harness fetcher={{ source_type: '', topic: 'own', config: '' }} />,
      { wrapper },
    );

    expect(await screen.findByText(SOURCE_TYPE_HINT)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText('Source type is required'),
    ).toBeInTheDocument();
    expect(screen.getByText(SOURCE_TYPE_HINT)).toBeInTheDocument();
    const sourceType = screen.getByLabelText(/^Source type/);
    expect(sourceType).toHaveAttribute('aria-invalid', 'true');
    expect(sourceType).toHaveAccessibleDescription(
      `Source type is required ${SOURCE_TYPE_HINT}`,
    );
  });

  it('marks the source type required, a rule the schema holds only for fetchers', async () => {
    render(
      <Harness fetcher={{ source_type: '', topic: 'own', config: '' }} />,
      { wrapper },
    );

    const sourceType = await screen.findByLabelText(/^Source type/);

    expect(screen.getByText('Source type').closest('label')).toHaveClass(
      'ant-form-item-required',
    );
    expect(sourceType).toHaveAttribute('aria-required', 'true');
  });

  it('shows the config error beside the hint when the config sets a key the engine owns', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        fetcher={{ source_type: 'crates_io', topic: 'own', config: '' }}
      />,
      { wrapper },
    );

    const config = await screen.findByLabelText('Config');
    await user.click(config);
    await user.paste('topic: main');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText(
        'The engine sets topic; remove it from the config',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(CONFIG_HINT)).toBeInTheDocument();
  });

  it('shows the config error beside the hint when the config is not a mapping', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        fetcher={{ source_type: 'crates_io', topic: 'own', config: '' }}
      />,
      { wrapper },
    );

    const config = await screen.findByLabelText('Config');
    await user.click(config);
    await user.paste('- crates');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      await screen.findByText('Config must be a YAML mapping of keys'),
    ).toBeInTheDocument();
    expect(screen.getByText(CONFIG_HINT)).toBeInTheDocument();
  });

  it('submits a config the engine takes and keeps its hint', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        fetcher={{
          source_type: 'crates_io',
          topic: 'own',
          config: 'crates:\n  - dfe-fetcher\n',
        }}
      />,
      { wrapper },
    );

    await screen.findByLabelText('Config');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(screen.getByText(CONFIG_HINT)).toBeInTheDocument();
    expect(screen.queryByText(/remove it from the config/)).toBeNull();
  });
});
