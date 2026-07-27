import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SsoButtons } from './SsoButtons';

// NEXT_PUBLIC_API_URL is 'http://localhost' in vitest.config.ts, so the login
// URL is deterministic.
const loginUrl = (provider: string) =>
  `http://localhost/api/v1/auth/oidc/${provider}/login`;

// jsdom's window.location.assign is non-configurable, so it cannot be spied
// directly. Replace the whole location property (via defineProperty, which
// bypasses the navigating setter) with a plain object carrying a mock assign,
// then restore it afterwards.
const realLocation = window.location;
const stubLocation = (assign: () => void) => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...realLocation, assign },
  });
};
const restoreLocation = () => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: realLocation,
  });
};

describe('SsoButtons', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    restoreLocation();
  });

  it('renders nothing when no providers are configured', () => {
    vi.stubEnv('NEXT_PUBLIC_OIDC_PROVIDERS', '');
    const { container } = render(<SsoButtons />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders one button per configured provider, with friendly labels', () => {
    vi.stubEnv('NEXT_PUBLIC_OIDC_PROVIDERS', 'google-workspace,okta');
    render(<SsoButtons />);
    expect(
      screen.getByRole('button', { name: 'Sign in with Google Workspace' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sign in with Okta' }),
    ).toBeInTheDocument();
  });

  it('title-cases an unknown provider id rather than dropping it', () => {
    vi.stubEnv('NEXT_PUBLIC_OIDC_PROVIDERS', 'my-idp');
    render(<SsoButtons />);
    expect(
      screen.getByRole('button', { name: 'Sign in with My Idp' }),
    ).toBeInTheDocument();
  });

  it('navigates the browser to the engine OIDC login endpoint on click', async () => {
    vi.stubEnv('NEXT_PUBLIC_OIDC_PROVIDERS', 'okta');
    const assign = vi.fn();
    stubLocation(assign);
    const user = userEvent.setup();

    render(<SsoButtons />);
    await user.click(screen.getByRole('button', { name: 'Sign in with Okta' }));

    expect(assign).toHaveBeenCalledWith(loginUrl('okta'));
  });
});
