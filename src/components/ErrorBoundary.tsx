import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    if (hasError) {
      const errorMessage = error?.message || 'Something went wrong.';

      return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          <div className="glass p-8 rounded-3xl max-w-md w-full text-center">
            <h2 className="text-2xl font-serif text-gold mb-4">Application Error</h2>
            <p className="text-white/60 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gold text-dark px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
