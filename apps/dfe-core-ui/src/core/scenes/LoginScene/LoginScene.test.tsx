import { loginNotice, loginWithNotice } from '@/core/config/loginNotice';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { LoginScene } from '.';

// The form fetches setup status; the notice above it is what is under test.
vi.mock('@/core/components/LoginLocalOidcSwitch', () => ({
  LoginLocalOidcSwitch: () => <div>login form</div>,
}));

describe('login notices', () => {
  test('a password change lands on a login that says why', () => {
    expect(loginWithNotice('password-changed')).toBe(
      '/login?notice=password-changed',
    );

    render(<LoginScene notice="password-changed" />);

    expect(screen.getByText('Password changed')).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in with your new password/),
    ).toBeInTheDocument();
  });

  test.each([undefined, '', 'anything-else', 'constructor', '__proto__'])(
    'a notice value of %j shows nothing, so a link cannot put words on the page',
    (value) => {
      expect(loginNotice(value)).toBeUndefined();

      render(<LoginScene notice={value} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('login form')).toBeInTheDocument();
    },
  );
});

// Tailwind's bg-background is a fixed light value, and antd paints its labels white in dark mode.
// A card without the dark pair leaves white labels on a white card.
describe('dark mode', () => {
  test('the card and the logo carry a dark pair, so the form stays readable', () => {
    render(<LoginScene />);

    const card = screen.getByText('login form').parentElement;
    expect(card).toHaveClass(
      'bg-background',
      'dark:bg-dark-background',
      'text-foreground',
      'dark:text-dark-foreground',
    );
    expect(card?.querySelector('svg')).toHaveClass('dark:text-white');
  });
});
