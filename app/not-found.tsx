import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-brand-border shadow-xl text-center space-y-6">
        <div className="mx-auto p-4 bg-brand-primary/10 rounded-full w-20 h-20 flex items-center justify-center">
          <Search className="h-10 w-10 text-brand-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-brand-primary">Media not found</h2>
          <p className="text-brand-muted">
            The page or media asset you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          href="/"
          className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
