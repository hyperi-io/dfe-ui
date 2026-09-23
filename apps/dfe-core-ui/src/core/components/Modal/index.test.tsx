import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '.';

describe('Modal', () => {
  it('opens when the open prop becomes true', () => {
    const { rerender } = render(
      <Modal open={false} title="Delete source">
        Are you sure?
      </Modal>,
    );

    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();

    rerender(
      <Modal open title="Delete source">
        Are you sure?
      </Modal>,
    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onCancel when the dialog is dismissed', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <Modal open title="Delete source" onCancel={onCancel}>
        Are you sure?
      </Modal>,
    );

    await user.click(screen.getByText('Close'));

    expect(onCancel).toHaveBeenCalled();
  });
});
