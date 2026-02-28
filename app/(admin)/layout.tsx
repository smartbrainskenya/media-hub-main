'use client';

import { SessionProvider } from 'next-auth/react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNav from '@/components/admin/AdminNav';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show sidebar/nav on login page
  if (pathname === '/login') {
    return (
      <SessionProvider>
        {children}
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="flex bg-brand-bg min-h-screen">
        <AdminSidebar />
        <div className="flex-grow flex flex-col">
          <AdminNav />
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
