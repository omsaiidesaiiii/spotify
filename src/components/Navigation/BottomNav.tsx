'use client';

import { Home, Search, Library } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Link } from 'next-view-transitions';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Library', href: '/library', icon: Library },
  ];

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 h-[calc(80px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Default to home icon active if we are on the root as well
        const isActive = pathname.startsWith(item.href) || (pathname === '/' && item.href === '/home');

        return (
          <Link
            key={item.href}
            href={item.href}
            className={twMerge(
              clsx(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
