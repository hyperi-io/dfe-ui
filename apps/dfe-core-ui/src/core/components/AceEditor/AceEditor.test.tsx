// The Ace mode and theme modules read the `ace` global, so it loads first.
import 'ace-builds/src-noconflict/ace';

import { AceEditor } from '@/core/components/AceEditor';
import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from 'antd';
import { describe, expect, it } from 'vitest';

const { wrapper } = buildTestWrapper().withTheme();

const HINT = "The fetcher's own YAML stanza.";
const ERROR = 'Config must be a YAML mapping of keys';

const rejectAlways = {
  validator: async () => {
    throw new Error(ERROR);
  },
};

const Harness = ({ required = false }: { required?: boolean }) => (
  <Form>
    <Form.Item
      name="config"
      label="Config"
      required={required}
      rules={[rejectAlways]}
      extra={HINT}
    >
      <AceEditor name="config" mode="yaml" height="100px" />
    </Form.Item>
    <Button htmlType="submit">Submit</Button>
  </Form>
);

describe('AceEditor in a Form.Item', () => {
  it('links the textbox to the hint before there is an error', () => {
    render(<Harness />, { wrapper });

    const textbox = screen.getByRole('textbox');
    expect(textbox).toHaveAccessibleDescription(HINT);
    expect(textbox).not.toHaveAttribute('aria-invalid');
  });

  it('marks the textbox invalid and links it to the error and the hint', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText(ERROR)).toBeInTheDocument();
    const textbox = screen.getByRole('textbox');
    expect(textbox).toHaveAttribute('aria-invalid', 'true');
    expect(textbox).toHaveAccessibleDescription(`${ERROR} ${HINT}`);
  });

  it('marks the textbox required when the field is required', () => {
    render(<Harness required />, { wrapper });

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });
});

describe('AceEditor aria attributes', () => {
  it('removes them from the textbox when the props go away', () => {
    const { rerender } = render(
      <AceEditor
        name="bare"
        aria-invalid="true"
        aria-describedby="bare_help"
        aria-required="true"
      />,
      { wrapper },
    );

    const textbox = screen.getByRole('textbox');
    expect(textbox).toHaveAttribute('aria-invalid', 'true');
    expect(textbox).toHaveAttribute('aria-describedby', 'bare_help');

    rerender(<AceEditor name="bare" />);

    expect(textbox).not.toHaveAttribute('aria-invalid');
    expect(textbox).not.toHaveAttribute('aria-describedby');
    expect(textbox).not.toHaveAttribute('aria-required');
  });
});
