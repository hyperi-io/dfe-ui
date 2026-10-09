import { Form } from '@/core/components/Form';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { render, screen } from '@testing-library/react';
import { Input } from 'antd';
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
