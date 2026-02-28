import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-brand-surface border-t border-brand-border py-6">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="text-sm text-brand-muted">
          &copy; {new Date().getFullYear()} Smart Brains Kenya. All rights reserved.
        </p>
        <Link 
          href="/login" 
          className="text-[10px] text-brand-bg hover:text-brand-muted transition-colors select-none"
          aria-label="Admin Access"
        >
          Admin Access
        </Link>
      </div>
    </footer>
  );
}
