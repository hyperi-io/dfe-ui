import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { toApiMatch, TMatchFormNode } from '@/Sources/utils/sourceMatch';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, FormRule } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import { MatchConditions } from '.';

const { wrapper } = buildTestWrapper().withTheme();

// The zod rules have their own tests, so every field accepts what it holds here.
const acceptAll: FormRule = { validator: async () => undefined };

const Harness = ({
  onFinish,
  match = { field: 'data_stream.dataset', operator: 'equals', value: 'a' },
}: {
  onFinish: (values: CreateUpdateSourceFormData) => void;
  match?: TMatchFormNode;
}) => {
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ match }}
    >
      <MatchConditions form={form} formValidation={acceptAll} />
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
};

/** What the form would send, built the way the source form builds it. */
const submitted = async (onFinish: ReturnType<typeof vi.fn>) => {
  const user = userEvent.setup();
  const calls = onFinish.mock.calls.length;
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(calls + 1));
  const values = onFinish.mock.calls[calls]?.[0] as CreateUpdateSourceFormData;
  return toApiMatch(values.match ?? {});
};

const pickMode = async (groupName: string, mode: string) => {
  const user = userEvent.setup();
  await user.click(
    screen.getByRole('combobox', {
      name: `${groupName}: how the conditions combine`,
    }),
  );
  await user.click(await screen.findByTitle(mode));
};

describe('MatchConditions', () => {
  it('shows one condition as the three fields it always had', async () => {
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} />, { wrapper });

    expect(screen.getByLabelText(/^Field/)).toHaveValue('data_stream.dataset');
    expect(screen.getByLabelText(/^Value/)).toHaveValue('a');
    expect(screen.queryByRole('group', { name: 'Conditions' })).toBeNull();
    expect(await submitted(onFinish)).toStrictEqual({
      field: 'data_stream.dataset',
      operator: 'equals',
      value: 'a',
    });
  });

  it('turns into a group of all conditions when a second is added', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Add condition' }));

    const group = await screen.findByRole('group', { name: 'Conditions' });
    expect(within(group).getByLabelText('Condition 1 field')).toHaveValue(
      'data_stream.dataset',
    );
    await user.type(
      within(group).getByLabelText('Condition 2 field'),
      'agent.type',
    );
    await user.type(
      within(group).getByLabelText('Condition 2 value'),
      'winlogbeat',
    );
    await user.click(within(group).getByLabelText('Condition 2: not'));

    expect(await submitted(onFinish)).toStrictEqual({
      all: [
        { field: 'data_stream.dataset', operator: 'equals', value: 'a' },
        {
          field: 'agent.type',
          operator: 'equals',
          value: 'winlogbeat',
          negate: true,
        },
      ],
    });
  });

  it('words a negated any as none of these', async () => {
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        match={{
          join: 'all',
          parts: [
            { field: 'level', operator: 'equals', value: 'debug' },
            { field: 'level', operator: 'equals', value: 'trace' },
          ],
        }}
      />,
      { wrapper },
    );

    await pickMode('Conditions', 'none');

    expect(await submitted(onFinish)).toStrictEqual({
      any: [
        { field: 'level', operator: 'equals', value: 'debug' },
        { field: 'level', operator: 'equals', value: 'trace' },
      ],
      negate: true,
    });
  });

  it('returns to the three fields when only one plain condition is left', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        match={{
          join: 'all',
          parts: [
            { field: 'host', operator: 'starts_with', value: 'fw-' },
            { field: 'level', operator: 'equals', value: 'debug' },
          ],
        }}
      />,
      { wrapper },
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove condition 2' }),
    );

    expect(await screen.findByLabelText(/^Field/)).toHaveValue('host');
    expect(screen.queryByRole('group', { name: 'Conditions' })).toBeNull();
    expect(await submitted(onFinish)).toStrictEqual({
      field: 'host',
      operator: 'starts_with',
      value: 'fw-',
    });
  });

  it('nests groups to the engine limit and offers no deeper one', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        match={{
          join: 'all',
          parts: [{ field: 'a', operator: 'equals', value: '1' }],
        }}
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Add group' }));
    const second = await screen.findByRole('group', { name: 'Group 2' });
    await user.click(within(second).getByRole('button', { name: 'Add group' }));
    const third = await screen.findByRole('group', { name: 'Group 2.3' });
    await user.click(within(third).getByRole('button', { name: 'Add group' }));
    const fourth = await screen.findByRole('group', { name: 'Group 2.3.3' });

    expect(
      within(fourth).getByRole('button', { name: 'Add group' }),
    ).toBeDisabled();
  });

  it('drops a nested group when its last condition is removed', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <Harness
        onFinish={onFinish}
        match={{
          join: 'any',
          parts: [
            { field: 'a', operator: 'equals', value: '1' },
            { field: 'b', operator: 'equals', value: '2' },
            {
              join: 'all',
              parts: [{ field: 'c', operator: 'exists', value: '' }],
            },
          ],
        }}
      />,
      { wrapper },
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove condition 3.1' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('group', { name: 'Group 3' })).toBeNull(),
    );
    expect(await submitted(onFinish)).toStrictEqual({
      any: [
        { field: 'a', operator: 'equals', value: '1' },
        { field: 'b', operator: 'equals', value: '2' },
      ],
    });
  });
});
