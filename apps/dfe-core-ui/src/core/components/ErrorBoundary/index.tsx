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

// Next stamps a server-render failure with a digest that matches the server log.
type DigestedError = Error & { digest?: unknown };

interface ErrorBoundaryState {
  hasError: boolean;
  error: DigestedError | null;
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

  componentDidCatch(error: DigestedError, info: React.ErrorInfo) {
    devLogger({
      level: 'error',
      label: 'ErrorBoundary',
      message: JSON.stringify({
        error: error.message,
        digest: error.digest,
        info,
      }),
    });
  }

  render() {
    if (this.state.hasError) {
      // The message is never shown: a production server-render failure arrives
      // as React's scrubbed "Minified React error #441".
      const digest = this.state.error?.digest;
      return (
        this.props.fallback ?? (
          <GenericErrorPage
            action={this.props.action ?? <ErrorBoundaryHomeAction />}
            className={this.props.className ?? 'h-screen w-screen'}
            description="Please try again later or contact support if the problem persists."
          >
            {typeof digest === 'string' && digest !== '' && (
              <p className="text-sm text-gray-500">Reference: {digest}</p>
            )}
          </GenericErrorPage>
        )
      );
    }

    return this.props.children;
  }
};
