import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { OKTA_CATALOGUE_ENTRY } from '@/core/config/api/endpoints/generator/mocks/sources';
import { Form } from '@/core/components/Form';
import { http, HttpResponse } from 'msw';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  CreateUpdateSourceFormData,
  formSchema,
} from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { act, render, screen, waitFor } from '@testing-library/react';
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

// jsdom has no IntersectionObserver, and the catalogue the variant select reads pages on one.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

// The zod rules have their own tests; every field accepts what it holds here.
const acceptAll: FormRule = { validator: async () => undefined };

const Harness = ({
  onFinish = vi.fn(),
  formValidation = acceptAll,
}: {
  onFinish?: (values: CreateUpdateSourceFormData) => void;
  formValidation?: FormRule;
}) => {
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <TransformForm formValidation={formValidation} />
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
};

/** The real source schema, so the engine rule is the one the form ships with. */
const SchemaHarness = () => {
  const formValidation =
    useAntdZodResolver<CreateUpdateSourceFormData>(formSchema);
  return <Harness formValidation={formValidation} />;
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

  it('shows the engine error beside the hint when no transform app is deployed', async () => {
    const user = userEvent.setup();
    server.use(
      API_CONFIG_MOCKS.apps.default.get.success({ mockedResponse: [] }),
    );
    render(<SchemaHarness />, { wrapper });

    const hint =
      'No transform app is deployed, so there are no engines to pick from';
    expect(await screen.findByText(hint)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Engine is required')).toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
    const engine = screen.getByLabelText(/^Transform Engine/);
    expect(engine).toHaveAttribute('aria-invalid', 'true');
    expect(engine).toHaveAccessibleDescription(`Engine is required ${hint}`);
  });

  it('shows the engine error when the transform apps are deployed and none is picked', async () => {
    const user = userEvent.setup();
    render(<SchemaHarness />, { wrapper });

    await screen.findByLabelText(/^Transform Engine/);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Engine is required')).toBeInTheDocument();
  });

  describe('variant', () => {
    const pickEngine = async (
      user: ReturnType<typeof userEvent.setup>,
      app: string,
    ) => {
      await user.click(await screen.findByLabelText(/^Transform Engine/));
      await user.click(await screen.findByTitle(app));
    };

    it('asks for a variant on an engine the catalogue offers programs for', async () => {
      const user = userEvent.setup();
      render(<Harness />, { wrapper });

      await pickEngine(user, 'dfe-transform-elastic');

      expect(await screen.findByLabelText(/^Variant/)).toBeInTheDocument();
    });

    it('asks for no variant on an engine that runs authored files', async () => {
      const user = userEvent.setup();
      render(<Harness />, { wrapper });

      await pickEngine(user, 'dfe-transform-vrl');

      // The catalogue has answered once the engine list has, so absence is settled.
      await waitFor(() =>
        expect(screen.getByLabelText(/^Transform Engine/)).toBeEnabled(),
      );
      expect(screen.queryByLabelText(/^Variant/)).not.toBeInTheDocument();
    });

    it('asks for a variant on an engine whose entries sort past the first page', async () => {
      const elastic = Array.from({ length: 60 }, (_, i) => ({
        ...OKTA_CATALOGUE_ENTRY,
        name: `elastic_${i}`,
      }));
      const vrl = {
        ...OKTA_CATALOGUE_ENTRY,
        name: 'zz_vrl',
        display_name: 'Late VRL entry',
        engine: 'VRL',
        variants: ['vrl.late'],
      };
      // The engine's order and paging, so only a filtered ask can see the late entry.
      server.use(
        http.get(
          API_CONFIG_MOCKS.sources.catalogue.mockedUrl,
          ({ request }) => {
            const params = new URL(request.url).searchParams;
            const engine = params.get('engine')?.toLowerCase();
            const perPage = Number(params.get('per_page') ?? 25);
            const page = Number(params.get('page') ?? 1);
            const all = [...elastic, vrl].filter(
              (entry) => !engine || entry.engine?.toLowerCase() === engine,
            );
            const totalPages = Math.ceil(all.length / perPage);
            return HttpResponse.json({
              items: all.slice((page - 1) * perPage, page * perPage),
              total: all.length,
              page,
              per_page: perPage,
              total_pages: totalPages,
              next_page: page < totalPages ? page + 1 : null,
              prev_page: page > 1 ? page - 1 : null,
            });
          },
        ),
      );
      const user = userEvent.setup();
      render(<Harness />, { wrapper });

      await pickEngine(user, 'dfe-transform-vrl');
      await user.click(await screen.findByLabelText(/^Variant/));

      expect(
        await screen.findByTitle('Late VRL entry (vrl.late)'),
      ).toBeInTheDocument();
    });

    it('asks for no variant on vrl when the engine ignores the engine filter', async () => {
      let askedForVrl = false;
      server.use(
        http.get(
          API_CONFIG_MOCKS.sources.catalogue.mockedUrl,
          ({ request }) => {
            if (new URL(request.url).searchParams.get('engine') === 'vrl') {
              askedForVrl = true;
            }
            return HttpResponse.json({
              items: [OKTA_CATALOGUE_ENTRY],
              total: 1069,
              page: 1,
              per_page: 1,
              total_pages: 1069,
              next_page: 2,
              prev_page: null,
            });
          },
        ),
      );
      const user = userEvent.setup();
      render(<Harness />, { wrapper });

      await pickEngine(user, 'dfe-transform-vrl');

      // Settled once the answer has been rendered, so absence is not the loading state.
      await waitFor(() => expect(askedForVrl).toBe(true));
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
      expect(screen.queryByLabelText(/^Variant/)).not.toBeInTheDocument();
    });

    it('refuses to submit an elastic transform with no variant', async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      render(<Harness onFinish={onFinish} />, { wrapper });

      await pickEngine(user, 'dfe-transform-elastic');
      await screen.findByLabelText(/^Variant/);
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(
        await screen.findByText('Variant is required'),
      ).toBeInTheDocument();
      expect(onFinish).not.toHaveBeenCalled();
    });

    it('submits the variant picked from the catalogue', async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      render(<Harness onFinish={onFinish} />, { wrapper });

      await pickEngine(user, 'dfe-transform-elastic');
      await user.click(await screen.findByLabelText(/^Variant/));
      await user.click(
        await screen.findByTitle('Okta system log (filebeat.okta.default)'),
      );
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
      const values = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
      expect(values.transform).toMatchObject({
        engine: 'elastic',
        variant: 'filebeat.okta.default',
      });
    });

    it('keeps a stored variant when the catalogue cannot be read', async () => {
      const onFinish = vi.fn();
      const user = userEvent.setup();
      server.use(API_CONFIG_MOCKS.sources.catalogue.get.error());
      const Stored = () => {
        const [form] = Form.useForm<CreateUpdateSourceFormData>();
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              transform: {
                engine: 'elastic',
                variant: 'filebeat.okta.default',
              },
            }}
          >
            <TransformForm formValidation={acceptAll} />
            <Button htmlType="submit">Submit</Button>
          </Form>
        );
      };
      render(<Stored />, { wrapper });

      await waitFor(() =>
        expect(screen.getByLabelText(/^Transform Engine/)).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
      const values = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
      expect(values.transform?.variant).toBe('filebeat.okta.default');
    });

    it('offers no variant when the catalogue cannot be read', async () => {
      const user = userEvent.setup();
      server.use(API_CONFIG_MOCKS.sources.catalogue.get.error());
      render(<Harness />, { wrapper });

      await pickEngine(user, 'dfe-transform-elastic');

      await waitFor(() =>
        expect(screen.getByLabelText(/^Transform Engine/)).toBeEnabled(),
      );
      expect(screen.queryByLabelText(/^Variant/)).not.toBeInTheDocument();
    });
  });

  describe('files', () => {
    it('offers no Files picker, since the Processing tab links files', async () => {
      render(<Harness />, { wrapper });

      await screen.findByLabelText(/^Transform Engine/);
      expect(screen.queryByLabelText(/^Files/)).not.toBeInTheDocument();
    });

    it.each([
      ['stored files', ['geo.mmdb', 'lookup.csv']],
      ['no files', []],
    ])('sends back %s on save', async (_case, files) => {
      const onFinish = vi.fn();
      const user = userEvent.setup();
      const Stored = () => {
        const [form] = Form.useForm<CreateUpdateSourceFormData>();
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ transform: { engine: 'vrl', files } }}
          >
            <TransformForm formValidation={acceptAll} />
            <Button htmlType="submit">Submit</Button>
          </Form>
        );
      };
      render(<Stored />, { wrapper });

      await screen.findByLabelText(/^Transform Engine/);
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
      const values = onFinish.mock.calls[0][0] as CreateUpdateSourceFormData;
      expect(values.transform?.files).toEqual(files);
    });
  });
});
