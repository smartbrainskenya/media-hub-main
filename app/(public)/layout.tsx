import './legacy-public.css';
import PublicNav from '@/components/public/PublicNav';
import PublicFooter from '@/components/public/PublicFooter';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="legacy-public">
      <div className="legacy-public-shell">
        <PublicNav />
        <main className="legacy-content">{children}</main>
        <PublicFooter />
      </div>
    </div>
  );
}
