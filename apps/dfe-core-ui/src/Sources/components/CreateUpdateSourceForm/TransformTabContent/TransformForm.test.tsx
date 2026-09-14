import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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
import { TransformForm } from './TransformForm';
import { server } from './TransformForm.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

// The zod rules have their own tests; every field accepts what it holds here.
const acceptAll: FormRule = { validator: async () => undefined };

const Harness = ({
  onFinish = vi.fn(),
}: {
  onFinish?: (values: CreateUpdateSourceFormData) => void;
}) => {
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <TransformForm formValidation={acceptAll} />
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
};

describe('TransformForm', () => {
  it('offers the transform apps the catalogue lists', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    await user.click(await screen.findByLabelText(/^Transform Engine/));

    expect(
      await screen.findByTitle('dfe-transform-elastic'),
    ).toBeInTheDocument();
    expect(await screen.findByTitle('dfe-transform-vrl')).toBeInTheDocument();
  });

  it('leaves out the catalogued apps that are not transforms', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    await user.click(await screen.findByLabelText(/^Transform Engine/));

    await screen.findByTitle('dfe-transform-vrl');
    expect(screen.queryByTitle('dfe-receiver')).not.toBeInTheDocument();
    expect(screen.queryByTitle('dfe-fetcher')).not.toBeInTheDocument();
  });

  it('submits the engine name rather than the app name', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} />, { wrapper });

    await user.click(await screen.findByLabelText(/^Transform Engine/));
    await user.click(await screen.findByTitle('dfe-transform-vrl'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    const values = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
    expect(values.transform?.engine).toBe('vrl');
  });

  it('says so when the catalogue offers no transform app', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.default.get.success({ mockedResponse: [] }),
    );
    render(<Harness />, { wrapper });

    expect(
      await screen.findByText(
        'No transform app is deployed, so there are no engines to pick from',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Transform Engine/)).toBeDisabled();
  });
});
