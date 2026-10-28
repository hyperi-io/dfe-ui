import { Form } from '@/core/components/Form';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Input } from 'antd';
import { describe, expect, it } from 'vitest';
import z from 'zod';

const schema = z.object({
  source: z.string().min(1),
  display_name: z.string().optional().nullable(),
});

const Demo = () => {
  const formValidation = useAntdZodResolver(schema);
  return (
    <Form>
      <Form.Item name="note" label="Note">
        <Input />
      </Form.Item>
      <Form.Item name="source" label="Source Name" rules={[formValidation]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="display_name"
        label="Display Name"
        rules={[formValidation]}
      >
        <Input />
      </Form.Item>
      <Button htmlType="submit">Save</Button>
    </Form>
  );
};

describe('Form.Item zod required mark', () => {
  it('shows the asterisk for required zod fields and not for optional ones', () => {
    const { container } = render(<Demo />);

    const requiredLabels = container.querySelectorAll(
      'label.ant-form-item-required',
    );
    expect(requiredLabels).toHaveLength(1);
    expect(requiredLabels[0]).toHaveTextContent('Source Name');
    expect(screen.getByText('Display Name').closest('label')).not.toHaveClass(
      'ant-form-item-required',
    );
  });
});

describe('Form.Item field errors', () => {
  it('announces a field error as it appears, and only the failing field', async () => {
    const user = userEvent.setup();
    render(<Demo />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const alert = await screen.findByRole('alert');
    expect(screen.getByLabelText('Source Name')).toHaveAccessibleDescription(
      alert.textContent ?? '',
    );
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });
});
