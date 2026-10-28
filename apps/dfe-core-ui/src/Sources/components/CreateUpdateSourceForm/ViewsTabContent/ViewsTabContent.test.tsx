import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, FormRule } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import { ViewsTabContent } from '.';

// The field map picker reads the engine, and the standard picker needs none of it.
vi.mock('./FieldMapSelectCreate', () => ({
  FieldMapSelectCreate: () => null,
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

// The zod rules have their own tests; every field accepts what it holds here.
const acceptAll: FormRule = { validator: async () => undefined };

const Harness = ({
  views,
  onFinish = vi.fn(),
}: {
  views: CreateUpdateSourceFormData['views'];
  onFinish?: (values: CreateUpdateSourceFormData) => void;
}) => {
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ views }}
      onFinish={onFinish}
    >
      <ViewsTabContent formValidation={acceptAll} form={form} />
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
};

const addView = () => screen.getByRole('button', { name: /Add View/ });

// Every option in the open picker, including one disabled as already selected.
const offeredStandards = () =>
  Array.from(
    document.querySelectorAll('.ant-select-item-option'),
    (option) => option.textContent,
  );

const NEW_VIEW_STANDARDS = [
  'Elastic Common Schema',
  'Common Information Model',
  'Open Cybersecurity Schema Framework',
];

describe('ViewsTabContent standard picker', () => {
  it('offers ECS, CIM and OCSF for a new view and not Sigma', async () => {
    const user = userEvent.setup();
    render(<Harness views={[]} />, { wrapper });

    await user.click(addView());
    await user.click(screen.getByRole('combobox'));

    expect(
      await screen.findByTitle('Elastic Common Schema'),
    ).toBeInTheDocument();
    expect(offeredStandards()).toEqual(NEW_VIEW_STANDARDS);
  });

  it('stops at three views on a source with no Sigma view', async () => {
    render(
      <Harness
        views={[{ standard: 'ecs' }, { standard: 'cim' }, { standard: 'ocsf' }]}
      />,
      { wrapper },
    );

    await waitFor(() => expect(addView()).toBeDisabled());
  });
});

describe('ViewsTabContent accessible names', () => {
  it('names each view delete button after its standard', async () => {
    const user = userEvent.setup();
    render(<Harness views={[{ standard: 'sigma' }, { standard: 'ecs' }]} />, {
      wrapper,
    });

    expect(
      await screen.findByRole('button', { name: 'Delete Sigma view' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Delete Elastic Common Schema view' }),
    ).toBeInTheDocument();

    await user.click(addView());
    expect(
      screen.getByRole('button', { name: 'Delete view' }),
    ).toBeInTheDocument();
  });

  it('names the delete button of a custom mapping', async () => {
    const user = userEvent.setup();
    render(<Harness views={[{ standard: 'ecs' }]} />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: /Add Custom Mapping/ }),
    );

    expect(
      screen.getByRole('button', { name: 'Delete custom mapping' }),
    ).toBeInTheDocument();
  });

  // The form falls back to the stored views only when none are submitted, so an emptied list must submit [].
  it('submits an empty list once every view is deleted', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        views={[{ standard: 'sigma' }, { standard: 'ecs' }]}
        onFinish={onFinish}
      />,
      { wrapper },
    );

    await user.click(
      await screen.findByRole('button', { name: 'Delete Sigma view' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete Elastic Common Schema view' }),
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    const values = onFinish.mock.calls[0]?.[0] as CreateUpdateSourceFormData;
    expect(values.views).toEqual([]);
  });

  it('names a standard another view already uses by its label', async () => {
    const user = userEvent.setup();
    render(<Harness views={[{ standard: 'ecs' }]} />, { wrapper });

    await user.click(addView());
    const added = screen.getAllByRole('combobox').at(1);
    if (!added) throw new Error('the added view has no standard picker');
    await user.click(added);

    const taken = await screen.findByRole('option', {
      name: 'Elastic Common Schema',
    });
    expect(taken).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('ViewsTabContent with an existing Sigma view', () => {
  it('shows the view as Sigma and does not let its standard change', async () => {
    render(<Harness views={[{ standard: 'sigma', taxonomy: 'windows' }]} />, {
      wrapper,
    });

    expect(
      await screen.findByText(
        'Sigma is kept on this view but cannot be picked for a new one',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Sigma')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('does not offer Sigma to a view added beside it', async () => {
    const user = userEvent.setup();
    render(<Harness views={[{ standard: 'sigma' }]} />, { wrapper });

    await user.click(addView());
    const added = screen.getAllByRole('combobox').at(1);
    if (!added) throw new Error('the added view has no standard picker');
    await user.click(added);

    expect(
      await screen.findByTitle('Elastic Common Schema'),
    ).toBeInTheDocument();
    expect(offeredStandards()).toEqual(NEW_VIEW_STANDARDS);
  });

  it('saves the Sigma view unchanged', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        views={[
          { standard: 'sigma', taxonomy: 'windows' },
          { standard: 'ecs' },
        ]}
        onFinish={onFinish}
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    const values = onFinish.mock.calls[0]?.[0] as CreateUpdateSourceFormData;
    expect(values.views).toMatchObject([
      { standard: 'sigma', taxonomy: 'windows' },
      { standard: 'ecs' },
    ]);
  });

  it('counts the Sigma view toward the limit, so all four standards fit', async () => {
    render(
      <Harness
        views={[
          { standard: 'sigma' },
          { standard: 'ecs' },
          { standard: 'cim' },
          { standard: 'ocsf' },
        ]}
      />,
      { wrapper },
    );

    await waitFor(() => expect(addView()).toBeDisabled());
  });

  it('leaves room for the last standard beside a Sigma view', async () => {
    render(
      <Harness
        views={[
          { standard: 'sigma' },
          { standard: 'ecs' },
          { standard: 'cim' },
        ]}
      />,
      { wrapper },
    );

    await waitFor(() => expect(addView()).toBeEnabled());
  });
});

describe('ViewsTabContent logsource fields', () => {
  it.each([
    { standard: 'sigma', shown: true },
    { standard: 'ecs', shown: false },
    { standard: 'cim', shown: false },
    { standard: 'ocsf', shown: false },
    { standard: '', shown: false },
  ])(
    'shows taxonomy, category and service on a $standard view: $shown',
    async ({ standard, shown }) => {
      render(<Harness views={[{ standard }]} />, { wrapper });

      await screen.findByRole('button', { name: /Delete .*view/ });
      for (const label of ['Taxonomy', 'Category', 'Service']) {
        expect(!!screen.queryByRole('textbox', { name: label })).toBe(shown);
      }
    },
  );

  it('keeps a stored taxonomy on an ECS view it no longer shows', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        views={[{ standard: 'ecs', taxonomy: 'windows' }]}
        onFinish={onFinish}
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    const values = onFinish.mock.calls[0]?.[0] as CreateUpdateSourceFormData;
    expect(values.views).toMatchObject([
      { standard: 'ecs', taxonomy: 'windows' },
    ]);
  });
});
