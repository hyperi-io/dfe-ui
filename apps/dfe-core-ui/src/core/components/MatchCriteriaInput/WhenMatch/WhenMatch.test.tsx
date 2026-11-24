import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MatchConditionsEditor } from '.';

describe('MatchConditionsEditor', () => {
  it('undoes and redoes a condition edit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MatchConditionsEditor
        value={null}
        onChange={onChange}
        operatorOptions={[]}
        matchDepthLimit={4}
      />,
    );

    await user.type(screen.getByPlaceholderText('Enter field'), 'a');
    expect(screen.getByPlaceholderText('Enter field')).toHaveValue('a');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByPlaceholderText('Enter field')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(screen.getByPlaceholderText('Enter field')).toHaveValue('a');
    expect(onChange).toHaveBeenLastCalledWith({ field: 'a' });
  });

  it('redoes deleting back to one condition', async () => {
    const user = userEvent.setup();
    render(
      <MatchConditionsEditor
        operatorOptions={[]}
        matchDepthLimit={4}
        value={{
          join: 'all',
          parts: [
            { field: 'host', operator: 'equals', value: 'a' },
            { field: 'user', operator: 'equals', value: 'b' },
          ],
        }}
        onChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove condition 2' }),
    );
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Redo' }));

    expect(screen.getByPlaceholderText('Enter field')).toHaveValue('host');
    expect(
      screen.queryByRole('textbox', { name: 'Condition 2 field' }),
    ).not.toBeInTheDocument();
  });

  it('keeps redo when the single field reports the undone text again', () => {
    render(
      <MatchConditionsEditor
        operatorOptions={[]}
        matchDepthLimit={4}
        value={{ field: 'host', operator: 'equals', value: 'a' }}
        onChange={vi.fn()}
      />,
    );

    const field = screen.getByPlaceholderText('Enter field');
    fireEvent.change(field, { target: { value: 'hostx' } });
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    fireEvent.change(field, { target: { value: 'hostx' } });

    expect(field).toHaveValue('host');
    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(field).toHaveValue('hostx');
  });

  it('lets one condition redo after the field undo shortcut', async () => {
    const user = userEvent.setup();
    render(
      <MatchConditionsEditor
        operatorOptions={[]}
        matchDepthLimit={4}
        value={{ field: 'host', operator: 'equals', value: 'a' }}
        onChange={vi.fn()}
      />,
    );

    const field = screen.getByPlaceholderText('Enter field');
    await user.type(field, 'ab');
    fireEvent.keyDown(field, { key: 'z', ctrlKey: true });
    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(beforeInput, 'inputType', { value: 'historyUndo' });
    field.dispatchEvent(beforeInput);

    expect(beforeInput.defaultPrevented).toBe(true);
    expect(field).toHaveValue('hosta');
    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(field).toHaveValue('hostab');
  });

  it('redoes a single condition edit from the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <MatchConditionsEditor
        operatorOptions={[]}
        matchDepthLimit={4}
        value={{ field: 'host', operator: 'equals', value: 'a' }}
        onChange={vi.fn()}
      />,
    );

    const field = screen.getByPlaceholderText('Enter field');
    await user.type(field, 'x');
    await user.keyboard('{Control>}z{/Control}');
    expect(field).toHaveValue('host');
    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled();

    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    expect(field).toHaveValue('hostx');
  });

  it('redoes an edit and an added condition from a single condition', async () => {
    const user = userEvent.setup();
    render(
      <MatchConditionsEditor
        operatorOptions={[]}
        matchDepthLimit={4}
        value={{ field: 'host', operator: 'equals', value: 'a' }}
        onChange={vi.fn()}
      />,
    );

    const field = screen.getByPlaceholderText('Enter field');
    await user.type(field, 'x');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(field).toHaveValue('host');
    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(screen.getByPlaceholderText('Enter field')).toHaveValue('hostx');

    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Redo' }));
    expect(
      screen.getByRole('group', { name: 'Conditions' }),
    ).toBeInTheDocument();
  });

  it('undoes adding a condition', async () => {
    const user = userEvent.setup();
    render(
      <MatchConditionsEditor
        value={null}
        onChange={vi.fn()}
        operatorOptions={[]}
        matchDepthLimit={4}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    expect(
      screen.getByRole('group', { name: 'Conditions' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(
      screen.queryByRole('group', { name: 'Conditions' }),
    ).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter field')).toBeInTheDocument();
  });

  it('undoes deleting a condition on the root', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MatchConditionsEditor
        operatorOptions={[]}
        matchDepthLimit={4}
        value={{
          join: 'all',
          parts: [
            { field: 'host', operator: 'equals', value: 'a' },
            { field: 'user', operator: 'equals', value: 'b' },
            { field: 'ip', operator: 'equals', value: 'c' },
          ],
        }}
        onChange={onChange}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Remove condition 2' }),
    );

    expect(
      screen.getByRole('textbox', { name: 'Condition 2 field' }),
    ).toHaveValue('ip');
    expect(
      screen.queryByRole('textbox', { name: 'Condition 3 field' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(
      screen.getByRole('textbox', { name: 'Condition 2 field' }),
    ).toHaveValue('user');
    expect(
      screen.getByRole('textbox', { name: 'Condition 3 field' }),
    ).toHaveValue('ip');
    expect(onChange).toHaveBeenLastCalledWith({
      join: 'all',
      parts: [
        { field: 'host', operator: 'equals', value: 'a' },
        { field: 'user', operator: 'equals', value: 'b' },
        { field: 'ip', operator: 'equals', value: 'c' },
      ],
    });
  });

  it('undoes a field edit on the root and deleting back to one condition', async () => {
    const user = userEvent.setup();
    render(
      <MatchConditionsEditor
        operatorOptions={[]}
        matchDepthLimit={4}
        value={{
          join: 'all',
          parts: [
            { field: 'host', operator: 'equals', value: 'a' },
            { field: 'user', operator: 'equals', value: 'b' },
          ],
        }}
        onChange={vi.fn()}
      />,
    );

    const field = screen.getByRole('textbox', { name: 'Condition 1 field' });
    await user.type(field, 'x');
    expect(field).toHaveValue('hostx');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(field).toHaveValue('host');

    await user.click(
      screen.getByRole('button', { name: 'Remove condition 2' }),
    );
    expect(screen.getByPlaceholderText('Enter field')).toHaveValue('host');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(
      screen.getByRole('textbox', { name: 'Condition 1 field' }),
    ).toHaveValue('host');
    expect(
      screen.getByRole('textbox', { name: 'Condition 2 field' }),
    ).toHaveValue('user');
  });
});
