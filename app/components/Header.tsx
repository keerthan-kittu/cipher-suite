'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Tools', href: '/tools' },
    { label: 'Reports', href: '/reports' },
  ];

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/20 px-4 sm:px-6 md:px-10 py-4 bg-black relative">
      <Link href="/" className="flex items-center gap-4 text-primary hover:text-gold-light transition-colors duration-300">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
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
                  ? 'text-primary'
                  : 'text-white/60 hover:text-primary'
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-glow-sm"></span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex cursor-pointer items-center justify-center h-10 w-10 transition-all duration-300 text-primary relative"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            {/* Top line */}
            <span 
              className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                mobileMenuOpen 
                  ? 'rotate-45 top-1/2 -translate-y-1/2' 
                  : 'top-1 translate-y-0'
              }`}
            />
            {/* Middle line */}
            <span 
              className={`absolute h-0.5 w-5 bg-current rounded-full top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            />
            {/* Bottom line */}
            <span 
              className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out ${
                mobileMenuOpen 
                  ? '-rotate-45 top-1/2 -translate-y-1/2' 
                  : 'bottom-1 translate-y-0'
              }`}
            />
          </div>
        </button>
        
        <button className="hidden md:flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-surface-elevated border border-primary/30 hover:border-primary hover:shadow-glow-sm transition-all duration-300 text-primary text-xl">
          👤
        </button>
      </div>

      <div 
        className={`absolute top-full left-0 right-0 bg-black border-b border-primary/20 md:hidden z-50 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col p-4">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-3 px-4 text-base font-medium rounded-lg transition-all duration-300 ${
                pathname === item.href
                  ? 'text-primary bg-surface-elevated'
                  : 'text-white/60 hover:text-primary hover:bg-surface-dark'
              }`}
              style={{
                animation: mobileMenuOpen ? `slideInDown 0.3s ease-out ${index * 0.1}s forwards` : 'none',
                opacity: mobileMenuOpen ? 1 : 0,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
