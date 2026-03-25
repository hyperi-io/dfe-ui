import { GenericErrorPage } from '@/core/components/GenericError';
import { devLogger } from '@repo/dev-logger';
import * as React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
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
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
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
            title="An unexpected error occurred"
            description="Please try again later or contact support if the problem persists."
          />
        )
      );
    }

    return this.props.children;
  }
};
