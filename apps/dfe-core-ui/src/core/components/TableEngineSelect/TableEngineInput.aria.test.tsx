import { Form } from '@/core/components/Form';
import { TTableEngine } from '@/core/hooks/useFetchTableEngines/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'antd';
import { describe, expect, it } from 'vitest';
import { TableEngineInput } from '.';

const { wrapper } = buildTestWrapper().withTheme();

const HINT = 'Leave blank to use the DFE default.';
const ERROR = 'CollapsingMergeTree requires arguments: sign_column';

const ENGINES: TTableEngine[] = [
  {
    name: 'CollapsingMergeTree',
    description: 'd',
    arguments: 'required',
    argument_hint: 'sign_column',
  },
];

const rejectAlways = {
  validator: async () => {
    throw new Error(ERROR);
  },
};

const Harness = ({
  engines,
  value,
}: {
  engines: TTableEngine[];
  value?: string;
}) => (
  <Form initialValues={{ engine: value }}>
    <Form.Item name="engine" label="Engine" rules={[rejectAlways]} extra={HINT}>
      <TableEngineInput engines={engines} loading={false} />
    </Form.Item>
    <Button htmlType="submit">Submit</Button>
  </Form>
);

const submit = async () => {
  await userEvent.setup().click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(ERROR)).toBeInTheDocument();
};

describe('TableEngineInput in a Form.Item', () => {
  it('links the engine picker to the error and the hint', async () => {
    render(<Harness engines={ENGINES} value="CollapsingMergeTree" />, {
      wrapper,
    });

    await submit();

    const picker = screen.getByRole('combobox');
    expect(picker).toHaveAttribute('aria-invalid', 'true');
    expect(picker).toHaveAccessibleDescription(`${ERROR} ${HINT}`);
  });

  it('links the arguments box to the error and the hint', async () => {
    render(<Harness engines={ENGINES} value="CollapsingMergeTree" />, {
      wrapper,
    });

    await submit();

    const args = screen.getByLabelText('CollapsingMergeTree arguments');
    expect(args).toHaveAttribute('aria-invalid', 'true');
    expect(args).toHaveAccessibleDescription(`${ERROR} ${HINT}`);
  });

  it('links the free-text box to the error and the hint when there is no registry', async () => {
    render(<Harness engines={[]} value="CollapsingMergeTree" />, { wrapper });

    await submit();

    const box = screen.getByRole('textbox');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription(`${ERROR} ${HINT}`);
  });
});
