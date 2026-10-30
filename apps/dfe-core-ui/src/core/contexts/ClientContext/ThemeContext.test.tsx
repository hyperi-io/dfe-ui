import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

const KEY = 'app-color-mode';

const Probe = () => {
  const { colorMode, toggleColorMode } = useTheme();
  return <button onClick={toggleColorMode}>{colorMode}</button>;
};

// StrictMode runs every effect twice, as next dev does, so a write that races
// the restore shows up here.
const renderProvider = () =>
  render(
    <StrictMode>
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    </StrictMode>,
  );

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ThemeProvider', () => {
  it.each(['dark', 'light'] as const)(
    'keeps a saved %s choice across a reload',
    async (saved) => {
      localStorage.setItem(KEY, saved);

      renderProvider();

      expect(await screen.findByRole('button', { name: saved })).toBeVisible();
      expect(localStorage.getItem(KEY)).toBe(saved);
      expect(document.documentElement.classList.contains('dark')).toBe(
        saved === 'dark',
      );
    },
  );

  it('starts light with nothing saved, and saves the toggle', async () => {
    const user = userEvent.setup();
    renderProvider();

    await waitFor(() => expect(localStorage.getItem(KEY)).toBe('light'));
    await user.click(screen.getByRole('button', { name: 'light' }));

    expect(screen.getByRole('button', { name: 'dark' })).toBeVisible();
    expect(localStorage.getItem(KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
