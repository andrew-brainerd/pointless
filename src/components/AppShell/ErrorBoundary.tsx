import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/common/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-4xl font-bold">Something broke</h1>
          <p className="max-w-md text-sm text-red-200">{this.state.error.message}</p>
          <div className="flex gap-2">
            <Button onClick={this.reset}>Try again</Button>
            <Button variant="ghost" onClick={() => window.location.assign('/')}>
              Go home
            </Button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
