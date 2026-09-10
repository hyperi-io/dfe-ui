import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from '.';

describe('Drawer', () => {
  // The close control lives in `extra`, so antd's own onClose has to be wired
  // or Escape reaches nothing.
  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Drawer title="Edit Source" open onClose={onClose}>
        <p>body</p>
      </Drawer>,
    );

    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });

    expect(onClose).toHaveBeenCalled();
  });

  it('closes on the X', () => {
    const onClose = vi.fn();
    render(
      <Drawer title="Edit Source" open onClose={onClose}>
        <p>body</p>
      </Drawer>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onClose).toHaveBeenCalled();
  });

  it('keeps a part-filled form when the mask is clicked', () => {
    const onClose = vi.fn();
    const { baseElement } = render(
      <Drawer title="Edit Source" open onClose={onClose}>
        <p>body</p>
      </Drawer>,
    );

    const mask = baseElement.querySelector('.ant-drawer-mask');
    expect(mask).not.toBeNull();
    fireEvent.click(mask as Element);

    expect(onClose).not.toHaveBeenCalled();
  });
});
