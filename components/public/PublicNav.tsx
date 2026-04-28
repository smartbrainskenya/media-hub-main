'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logo from '@/assets/logos/Main Blue Logo Transparent.png.png';

export default function PublicNav() {
  const pathname = usePathname();
  const links = [{ href: '/images', label: 'Images' }, { href: '/videos', label: 'Videos' }];

  return (
    <nav className="legacy-navbar" aria-label="Primary">
      <Link href="/" className="legacy-nav-brand">
        <Image src={logo} alt="Smart Brains MediaHub" priority />
        <span>Smart Brains MediaHub</span>
      </Link>
      <div className="legacy-nav-links">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`legacy-nav-link${isActive ? ' is-active' : ''}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
