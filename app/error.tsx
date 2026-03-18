'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, AlertCircle, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GLOBAL_ERROR]', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in duration-700">
      <div className="max-w-lg w-full bg-white p-10 rounded-3xl border border-brand-border shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-danger via-brand-primary to-brand-danger"></div>
        
        <div className="mx-auto p-6 bg-brand-danger/5 rounded-full w-24 h-24 flex items-center justify-center">
          <AlertCircle className="h-12 w-12 text-brand-danger" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-brand-primary">Unexpected Error</h2>
          <p className="text-brand-muted leading-relaxed max-w-sm mx-auto">
            Something went wrong while loading this page. Our team has been notified.
            <span className="block mt-2 text-xs opacity-50 font-mono">ID: {error.digest || 'Internal'}</span>
          </p>
        </div>

        <div className="grid gap-3 pt-4 sm:grid-cols-2">
          <button
            onClick={reset}
            className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Try Again
          </button>
          
          <Link 
            href="/"
            className="w-full py-4 bg-brand-surface text-brand-primary border border-brand-border font-bold rounded-2xl hover:bg-brand-bg transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Home Page
          </Link>
        </div>

        <p className="text-xs text-brand-muted">
          If the problem persists, please contact Smart Brains Kenya support.
        </p>
      </div>
    </div>
  );
}
