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
