import { GenericErrorPage } from '@/core/components/GenericError';
import { devLogger } from '@repo/dev-logger';
import { IconHome } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import * as React from 'react';

const ErrorBoundaryHomeAction = () => {
  const router = useRouter();
  return (
    <Button
      icon={<IconHome />}
      className="mt-6"
      onClick={() => router.push('/')}
    >
      Home
    </Button>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  action?: React.ReactNode | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
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
            action={this.props.action ?? <ErrorBoundaryHomeAction />}
            className={this.props.className ?? 'h-screen w-screen'}
            title={this.state.error?.message ?? 'An unexpected error occurred'}
            description="Please try again later or contact support if the problem persists."
          />
        )
      );
    }

    return this.props.children;
  }
};
