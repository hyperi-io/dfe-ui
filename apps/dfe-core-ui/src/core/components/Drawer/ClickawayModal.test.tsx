import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClickawayModal } from './ClickawayModal';

describe('ClickawayModal', () => {
  it('lets the backdrop pass clicks through while the card stays clickable', () => {
    const { container } = render(
      <ClickawayModal onOk={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(container.firstChild).toHaveClass('pointer-events-none');
    expect(
      screen.getByText('Unsaved changes').closest('.ant-card'),
    ).toHaveClass('pointer-events-auto');
  });

  it('calls onCancel when Keep editing is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ClickawayModal onOk={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onOk when Discard is clicked', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    render(<ClickawayModal onOk={onOk} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Discard' }));

    expect(onOk).toHaveBeenCalled();
  });
});
