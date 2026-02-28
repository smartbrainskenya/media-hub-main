'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('[GLOBAL_ERROR]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-brand-border shadow-xl text-center space-y-6">
        <div className="mx-auto p-4 bg-brand-danger/10 rounded-full w-20 h-20 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-brand-danger" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-brand-primary">Something went wrong</h2>
          <p className="text-brand-muted">
            We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-5 w-5" />
          Try Again
        </button>

        <a 
          href="/"
          className="block text-sm font-semibold text-brand-muted hover:text-brand-primary transition-colors"
        >
          Return to Homepage
        </a>
      </div>
    </div>
  );
}
