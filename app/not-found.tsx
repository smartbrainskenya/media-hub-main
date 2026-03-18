import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Smart Brains Media Hub',
  description: 'The requested page could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in duration-700">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-brand-border shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary"></div>
        
        <div className="mx-auto p-6 bg-brand-primary/5 rounded-full w-24 h-24 flex items-center justify-center animate-bounce duration-[2000ms]">
          <Search className="h-12 w-12 text-brand-primary" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-brand-primary tracking-tight">404</h1>
          <h2 className="text-2xl font-bold text-brand-primary">Page Not Found</h2>
          <p className="text-brand-muted leading-relaxed">
            The media asset or page you&apos;re looking for has vanished into the digital void.
          </p>
        </div>

        <div className="grid gap-3 pt-4">
          <Link
            href="/"
            className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
          
          <Link 
            href="/images"
            className="w-full py-4 bg-brand-surface text-brand-primary border border-brand-border font-bold rounded-2xl hover:bg-brand-bg transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Browse Images
          </Link>
        </div>
      </div>
    </div>
  );
}
