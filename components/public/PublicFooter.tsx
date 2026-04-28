import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="legacy-admin-access">
      <p className="text-sm text-brand-muted">
        &copy; {new Date().getFullYear()} Smart Brains Kenya. All rights reserved.
      </p>
      <Link href="/login" className="legacy-admin-access-link" aria-label="Admin Access">
        Admin Access
      </Link>
    </footer>
  );
}
