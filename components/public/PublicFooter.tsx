export default function PublicFooter() {
  return (
    <footer className="bg-brand-surface border-t border-brand-border py-6">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-brand-muted">
          &copy; {new Date().getFullYear()} Smart Brains Kenya. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
