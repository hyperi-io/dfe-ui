import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '.';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// What React's Flight client hands the page in a production build, in place of
// the message a server render threw.
const SCRUBBED_SERVER_RENDER_MESSAGE =
  'Minified React error #441; visit https://react.dev/errors/441 for the full message or use the non-minified dev environment for full errors and additional help.';

const Thrower = ({ message, digest }: { message: string; digest?: string }) => {
  throw Object.assign(
    new Error(message),
    digest === undefined ? {} : { digest },
  );
};

describe('ErrorBoundary', () => {
  /* eslint-disable no-console */
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = () => undefined;
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });
  /* eslint-enable no-console */

  it('renders children when they do not throw', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('titles the fallback page generically, whatever was thrown', () => {
    render(
      <ErrorBoundary>
        <Thrower message="Schema load failed" />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', { name: /An unexpected error occurred/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Schema load failed')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please try again later or contact support if the problem persists.',
      ),
    ).toBeInTheDocument();
  });

  it('never shows the scrubbed server-render message, and keeps its digest for support', () => {
    render(
      <ErrorBoundary>
        <Thrower message={SCRUBBED_SERVER_RENDER_MESSAGE} digest="1234567890" />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', { name: /An unexpected error occurred/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Minified React error/)).not.toBeInTheDocument();
    expect(screen.queryByText(/react\.dev/)).not.toBeInTheDocument();
    expect(screen.getByText('Reference: 1234567890')).toBeInTheDocument();
  });

  it('shows no reference line when the error carries no digest', () => {
    render(
      <ErrorBoundary>
        <Thrower message="Schema load failed" />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/Reference:/)).not.toBeInTheDocument();
  });

  it('never shows the stack', () => {
    const Stacked = () => {
      const error = new Error('Schema load failed');
      error.stack =
        'Error: Schema load failed\n    at secretInternalFrame (/srv/app.js:1:1)';
      throw error;
    };

    render(
      <ErrorBoundary>
        <Stacked />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/secretInternalFrame/)).not.toBeInTheDocument();
  });

  it('renders a custom fallback when supplied', () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Thrower message="Schema load failed" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });
});
