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
    <nav className="bg-brand-surface/80 backdrop-blur-md border-b border-brand-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">SB</span>
              </div>
              <span className="font-display font-semibold text-brand-primary text-[15px] tracking-tight">
                Media Hub
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                      isActive
                        ? "bg-brand-primary text-white"
                        : "text-brand-muted hover:text-brand-text hover:bg-brand-hover"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-brand-muted hover:text-brand-primary rounded-md hover:bg-brand-hover transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="sm:hidden bg-brand-surface border-b border-brand-border px-4 pt-2 pb-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded-md transition-all",
                  isActive
                    ? "bg-brand-primary text-white"
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-hover"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
