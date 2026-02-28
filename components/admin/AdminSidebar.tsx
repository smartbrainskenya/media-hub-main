'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Upload, 
  Link as LinkIcon, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/upload', label: 'Upload Media', icon: Upload },
    { href: '/admin/import', label: 'Import by URL', icon: LinkIcon },
  ];

  return (
    <aside 
      className={cn(
        "bg-brand-primary text-white h-screen flex flex-col transition-all duration-300 sticky top-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        {!isCollapsed && (
          <span className="font-bold text-lg whitespace-nowrap">
            Media <span className="text-brand-secondary">Hub Admin</span>
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-6">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Logged in as</p>
          <p className="font-semibold text-sm truncate">{session?.user?.name}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-grow mt-4 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                isActive 
                  ? "bg-brand-secondary text-brand-primary font-semibold" 
                  : "hover:bg-white/10 text-white/80"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-brand-primary" : "text-white/80")} />
              {!isCollapsed && <span className="text-sm">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-brand-danger/20 hover:text-red-400 transition-colors group"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
