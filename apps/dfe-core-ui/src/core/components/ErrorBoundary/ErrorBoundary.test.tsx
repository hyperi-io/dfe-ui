import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ErrorBoundary } from '.';

const Thrower = ({ message }: { message: string }) => {
  throw new Error(message);
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

  it('renders the thrown error message on the fallback page', () => {
    render(
      <ErrorBoundary>
        <Thrower message="Schema load failed" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Schema load failed')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please try again later or contact support if the problem persists.',
      ),
    ).toBeInTheDocument();
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
