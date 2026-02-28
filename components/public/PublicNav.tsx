'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function PublicNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const links = [{ href: '/images', label: 'Images' }, { href: '/videos', label: 'Videos' }];

  return (
    <nav className="bg-brand-surface border-b border-brand-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-brand-primary">
              Smart Brains <span className="text-brand-secondary">Media Hub</span>
            </Link>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={cn("px-3 py-2 text-sm font-medium transition-colors", pathname.startsWith(link.href) ? "text-brand-secondary border-b-2 border-brand-secondary" : "text-brand-muted hover:text-brand-primary")}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center sm:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-brand-muted hover:text-brand-primary focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="sm:hidden bg-brand-surface border-b border-brand-border px-4 pt-2 pb-3 space-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={cn("block px-3 py-2 text-base font-medium", pathname.startsWith(link.href) ? "text-brand-secondary" : "text-brand-muted")}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
