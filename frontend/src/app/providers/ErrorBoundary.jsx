import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="theme-page flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md animate-fade-in">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-red-500/10 text-4xl text-red-400">
              !
            </div>
            <h1 className="theme-text text-3xl font-black">Something went wrong</h1>
            <p className="theme-muted mt-3 text-sm leading-7">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 font-black text-black transition hover:bg-amber-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
