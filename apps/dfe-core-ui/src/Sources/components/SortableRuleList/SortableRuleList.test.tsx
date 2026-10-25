import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SortableRuleItem, SortableRuleList } from '.';

const { wrapper } = buildTestWrapper().withTheme();

type Row = SortableRuleItem & { name: string };

const ROWS: Row[] = [
  { id: 'a', name: 'alpha' },
  { id: 'b', name: 'bravo' },
  { id: 'c', name: 'charlie' },
  { id: 'default', name: 'Default', pinned: true },
];

const Harness = ({ disabled = false }: { disabled?: boolean }) => {
  const [rows, setRows] = useState(ROWS);
  return (
    <SortableRuleList
      items={rows}
      label="Source rules order"
      itemName={(row) => row.name}
      disabled={disabled}
      renderItem={(row) => <span>{row.name}</span>}
      onMove={(from, to) =>
        setRows((current) => {
          const next = [...current];
          const [moved] = next.splice(from, 1);
          if (moved) next.splice(to, 0, moved);
          return next;
        })
      }
    />
  );
};

const order = () =>
  within(screen.getByRole('list', { name: 'Source rules order' }))
    .getAllByRole('listitem')
    .map((item) => item.getAttribute('data-testid'));

const announced = () => screen.getByRole('status').textContent;

describe('SortableRuleList', () => {
  it('moves a row with the arrow keys on its handle and announces where it went', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    const handle = screen.getByRole('button', {
      name: 'Reorder alpha, position 1 of 3',
    });
    handle.focus();
    await user.keyboard('{ArrowDown}');

    expect(order()).toEqual([
      'rule-block-b',
      'rule-block-a',
      'rule-block-c',
      'rule-block-default',
    ]);
    expect(announced()).toBe('Moved alpha to position 2 of 3.');
    expect(
      screen.getByRole('button', { name: 'Reorder alpha, position 2 of 3' }),
    ).toHaveFocus();

    await user.keyboard('{End}');
    expect(order()[2]).toBe('rule-block-a');
    expect(announced()).toBe('Moved alpha to position 3 of 3.');
  });

  it('never moves a row past the pinned default', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    screen
      .getByRole('button', { name: 'Reorder charlie, position 3 of 3' })
      .focus();
    await user.keyboard('{ArrowDown}');

    expect(order().at(-1)).toBe('rule-block-default');
    expect(
      screen.getByRole('button', { name: 'Move charlie down' }),
    ).toBeDisabled();
  });

  it('gives a pinned row no handle and no move buttons', () => {
    render(<Harness />, { wrapper });

    const pinned = screen.getByTestId('rule-block-default');
    expect(within(pinned).getByRole('img', { name: 'Default is pinned' }));
    expect(within(pinned).queryAllByRole('button')).toHaveLength(0);
    expect(pinned).not.toHaveAttribute('draggable', 'true');
  });

  it('moves with the up button and keeps focus on it', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Move charlie up' }));

    expect(order().slice(0, 3)).toEqual([
      'rule-block-a',
      'rule-block-c',
      'rule-block-b',
    ]);
    expect(
      screen.getByRole('button', { name: 'Move charlie up' }),
    ).toHaveFocus();
  });

  it('hands focus to the handle when the move disables the button it used', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Move bravo up' }));

    expect(order()[0]).toBe('rule-block-b');
    expect(
      screen.getByRole('button', { name: 'Reorder bravo, position 1 of 3' }),
    ).toHaveFocus();
  });

  it('moves to a chosen position from the menu', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    await user.click(
      screen.getByRole('button', { name: 'Move alpha to position' }),
    );
    await user.click(await screen.findByText('Position 3'));

    expect(order().slice(0, 3)).toEqual([
      'rule-block-b',
      'rule-block-c',
      'rule-block-a',
    ]);
    expect(announced()).toBe('Moved alpha to position 3 of 3.');
  });

  it('lands a dragged row before the row it is dropped on', () => {
    render(<Harness />, { wrapper });
    const source = screen.getByTestId('rule-block-a');
    const target = screen.getByTestId('rule-block-c');
    const dataTransfer = {
      setData: () => undefined,
      effectAllowed: '',
      dropEffect: '',
    };

    fireEvent.dragStart(source, { dataTransfer });
    // jsdom drag events carry no pointer position, which reads as the row's upper half.
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(order().slice(0, 3)).toEqual([
      'rule-block-b',
      'rule-block-a',
      'rule-block-c',
    ]);
    expect(announced()).toBe('Moved alpha to position 2 of 3.');
  });

  it('refuses a drop on the pinned default', () => {
    render(<Harness />, { wrapper });
    const dataTransfer = {
      setData: () => undefined,
      effectAllowed: '',
      dropEffect: '',
    };

    fireEvent.dragStart(screen.getByTestId('rule-block-a'), { dataTransfer });
    fireEvent.dragOver(screen.getByTestId('rule-block-default'), {
      dataTransfer,
    });
    fireEvent.drop(screen.getByTestId('rule-block-default'), { dataTransfer });

    expect(order()).toEqual([
      'rule-block-a',
      'rule-block-b',
      'rule-block-c',
      'rule-block-default',
    ]);
  });

  it('offers no moves while disabled', () => {
    render(<Harness disabled />, { wrapper });

    expect(screen.queryByRole('button', { name: /^Move / })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Reorder / })).toBeNull();
  });
});
