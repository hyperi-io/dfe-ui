import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, FormRule } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import { formSchema, type CreateFieldMapFormData } from '..';
import { MappingBuilder } from '.';

const { wrapper } = buildTestWrapper().withTheme();

// The schema has its own test below; every field accepts what it holds here.
const acceptAll: FormRule = { validator: async () => undefined };

const Harness = ({
  onFinish,
}: {
  onFinish: (values: Pick<CreateFieldMapFormData, 'mappings'>) => void;
}) => {
  const [form] = Form.useForm<Pick<CreateFieldMapFormData, 'mappings'>>();
  return (
    <Form
      form={form}
      initialValues={{ mappings: [['', '']] }}
      onFinish={onFinish}
    >
      <MappingBuilder formValidation={acceptAll} />
      <Button htmlType="submit">Submit</Button>
    </Form>
  );
};

describe('MappingBuilder', () => {
  // The engine reads each pair as standard_field -> source column.
  it('puts the standard field first and the source field second', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} />, { wrapper });

    await user.type(
      screen.getByRole('textbox', { name: 'Standard field' }),
      'process.command_line',
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Source field' }),
      'CommandLine',
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinish.mock.calls[0]?.[0]).toEqual({
      mappings: [['process.command_line', 'CommandLine']],
    });
  });

  it('keeps naming each side once the placeholder is gone', async () => {
    const user = userEvent.setup();
    render(<Harness onFinish={vi.fn()} />, { wrapper });

    await user.type(screen.getByPlaceholderText('Enter source field'), 'x');

    expect(
      screen.getByRole('textbox', { name: 'Source field' }),
    ).toHaveDisplayValue('x');
    expect(
      screen.getByPlaceholderText('Enter standard field'),
    ).toHaveAccessibleName('Standard field');
  });
});

describe('CreateFieldMapForm mapping rules', () => {
  const withMapping = (mapping: [string, string]) =>
    formSchema.safeParse({ standard: 'ecs', mappings: [mapping] });

  const messageAt = (mapping: [string, string], side: 0 | 1) =>
    withMapping(mapping).error?.issues.find(
      (issue) => issue.path.join('.') === `mappings.0.${side}`,
    )?.message;

  it('names the standard field when it is empty', () => {
    expect(messageAt(['', 'CommandLine'], 0)).toBe(
      'Standard field is required',
    );
  });

  it('names the source field when it is empty', () => {
    expect(messageAt(['process.command_line', ''], 1)).toBe(
      'Source field is required',
    );
  });

  it('accepts a pair with both sides filled', () => {
    expect(withMapping(['process.command_line', 'CommandLine']).success).toBe(
      true,
    );
  });
});
