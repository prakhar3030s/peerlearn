import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // eslint-disable-next-line no-console
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex items-center justify-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-brand-500 via-brand-400 to-accent-500" />
              <span className="text-base font-bold text-gradient">PeerLearn</span>
            </div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              An unexpected error occurred while rendering this page. You can try
              reloading, or go back to the home screen.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-default)] hover:bg-[var(--bg-raised)]"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[linear-gradient(135deg,#1E4D8C_0%,#2563EB_50%,#6366F1_100%)] px-4 text-sm font-semibold text-white shadow-md hover:shadow-lg"
              >
                Go Home
              </button>
            </div>
            {isDev && this.state.error && (
              <details className="mt-6 max-h-64 overflow-auto rounded-lg bg-slate-900 px-4 py-3 text-left text-xs text-slate-100 shadow-inner">
                <summary className="cursor-pointer text-[11px] font-semibold">
                  View error details (development only)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {"\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

