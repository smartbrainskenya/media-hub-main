'use client';

import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();
  
  const getPageTitle = (path: string) => {
    if (path === '/admin') return 'Dashboard Overview';
    if (path === '/admin/upload') return 'Upload New Media';
    if (path === '/admin/import') return 'Import from External URL';
    if (path.startsWith('/admin/media/')) return 'Edit Media Asset';
    return 'Admin Control Panel';
  };

  return (
    <header className="h-16 bg-white border-b border-brand-border flex items-center px-8 shadow-sm">
      <h2 className="text-xl font-bold text-brand-primary">
        {getPageTitle(pathname)}
      </h2>
    </header>
  );
}
