'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Person, LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../providers/ThemeProvider';

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Tools', href: '/tools' },
    { label: 'Reports', href: '/reports' },
  ];

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-300 dark:border-white/10 px-4 sm:px-6 md:px-10 py-4 bg-white dark:bg-transparent">
      <Link href="/" className="flex items-center gap-4 text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
        <Shield className="text-primary text-3xl" />
        <h2 className="text-xl font-bold leading-tight tracking-tight">Cipher Suite</h2>
      </Link>

      <nav className="hidden md:flex flex-1 justify-center gap-8">
        <div className="flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium leading-normal relative transition-colors duration-300 ${
                pathname === item.href
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-gray-100 dark:bg-surface-dark border border-gray-300 dark:border-white/10 hover:border-primary/50 transition-colors duration-300 text-gray-900 dark:text-white"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <LightMode className="text-xl" /> : <DarkMode className="text-xl" />}
        </button>
        <button className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-gray-100 dark:bg-surface-dark border border-gray-300 dark:border-white/10 hover:border-primary/50 transition-colors duration-300 text-gray-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em]">
          <Person className="text-xl" />
        </button>
      </div>
    </header>
  );
}
