import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { navigateWithReload } = vi.hoisted(() => ({
  navigateWithReload: vi.fn(),
}));

vi.mock('@/core/utils/navigation', () => ({ navigateWithReload }));

const { EngineUnavailableScene } = await import('.');

describe('EngineUnavailableScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('says the engine cannot be reached, without naming an address', () => {
    const { container } = render(<EngineUnavailableScene />);

    expect(
      screen.getByRole('heading', { name: 'Cannot reach the DFE engine' }),
    ).toBeInTheDocument();
    expect(container).toHaveTextContent(
      'The console could not connect to the engine. Check that it is running, then try again.',
    );
    expect(container.textContent).not.toMatch(/https?:|localhost|ECONN/);
  });

  test('reloads the page it is shown on when the user retries', async () => {
    const user = userEvent.setup();
    render(<EngineUnavailableScene />);

    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(navigateWithReload).toHaveBeenCalledWith(window.location.href);
  });
});
