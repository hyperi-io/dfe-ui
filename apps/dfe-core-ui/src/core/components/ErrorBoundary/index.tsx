import { GenericErrorPage } from '@/core/components/GenericError';
import { devLogger } from '@repo/dev-logger';
import * as React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ErrorBoundary = class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    devLogger({
      level: 'error',
      label: 'ErrorBoundary',
      message: JSON.stringify({ error: error.message, info }),
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      // Display a generic error component if no fallback supplied
      return (
        this.props.fallback ?? (
          <GenericErrorPage
            className="h-screen w-screen"
            title={this.state.error?.message ?? 'An unexpected error occurred'}
            description="Please try again later or contact support if the problem persists."
          />
        )
      );
    }

    return this.props.children;
  }
};
