import { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="theme-page flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md"
          >
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-red-500/10 text-red-400">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h1 className="theme-text text-3xl font-black">Something went wrong</h1>
            <p className="theme-muted mt-3 text-sm leading-7">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 font-black text-black transition hover:bg-amber-200"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
