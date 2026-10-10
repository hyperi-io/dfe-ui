import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from '.';

const renderDrawer = (onClose: () => void) =>
  render(
    <App>
      <Drawer title="Edit Source" open onClose={onClose}>
        <p>body</p>
      </Drawer>
    </App>,
  );

const clickMask = (container: HTMLElement) => {
  const mask = container.querySelector('.ant-drawer-mask');
  expect(mask).not.toBeNull();
  fireEvent.click(mask as Element);
};

describe('Drawer', () => {
  // The close control lives in `extra`, so antd's own onClose has to be wired
  // or Escape reaches nothing.
  it('closes on Escape when clickaway protection is off', () => {
    const onClose = vi.fn();
    render(
      <App>
        <Drawer
          title="Edit Source"
          open
          onClose={onClose}
          preventClickaway={{ enabled: false }}
        >
          <p>body</p>
        </Drawer>
      </App>,
    );

    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });

    expect(onClose).toHaveBeenCalled();
  });

  it('warns on Escape when clickaway protection is on', async () => {
    const onClose = vi.fn();
    renderDrawer(onClose);

    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });

    expect(onClose).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Closing now may discard unsaved data.'),
    ).toBeInTheDocument();
  });

  it('names its close button for assistive tech', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDrawer(onClose);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('closes on the X when clickaway protection is off', () => {
    const onClose = vi.fn();
    render(
      <App>
        <Drawer
          title="Edit Source"
          open
          onClose={onClose}
          preventClickaway={{ enabled: false }}
        >
          <p>body</p>
        </Drawer>
      </App>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('closes on the X when clickaway protection is on', () => {
    const onClose = vi.fn();
    renderDrawer(onClose);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
    expect(
      screen.queryByText('Closing now may discard unsaved data.'),
    ).not.toBeInTheDocument();
  });

  it('warns about data loss when the mask is clicked', async () => {
    const onClose = vi.fn();
    const { baseElement } = renderDrawer(onClose);

    clickMask(baseElement);

    expect(onClose).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Closing now may discard unsaved data.'),
    ).toBeInTheDocument();
  });

  it('closes after confirming a mask click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { baseElement } = renderDrawer(onClose);

    clickMask(baseElement);
    await user.click(await screen.findByRole('button', { name: 'Discard' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('stays open when the mask-click warning is cancelled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { baseElement } = renderDrawer(onClose);

    clickMask(baseElement);
    await user.click(
      await screen.findByRole('button', { name: 'Keep editing' }),
    );

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes the drawer and warning on a second mask click', async () => {
    const onClose = vi.fn();
    const { baseElement } = renderDrawer(onClose);

    clickMask(baseElement);
    expect(
      await screen.findByText('Closing now may discard unsaved data.'),
    ).toBeInTheDocument();

    clickMask(baseElement);

    expect(onClose).toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByText('Closing now may discard unsaved data.'),
      ).not.toBeInTheDocument();
    });
  });

  it('dismisses only the warning when the drawer panel is clicked', async () => {
    const onClose = vi.fn();
    const { baseElement } = renderDrawer(onClose);

    clickMask(baseElement);
    expect(
      await screen.findByText('Closing now may discard unsaved data.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('body'));

    await waitFor(() => {
      expect(
        screen.queryByText('Closing now may discard unsaved data.'),
      ).not.toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
