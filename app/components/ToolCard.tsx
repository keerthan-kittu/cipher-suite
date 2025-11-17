import React from 'react';
import Link from 'next/link';
import { ArrowForward } from '@mui/icons-material';

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export default function ToolCard({ icon, title, description, buttonText, href }: ToolCardProps) {
  return (
    <div className="group relative flex flex-col justify-between gap-6 p-6 sm:p-8 bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-glow-md hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary border border-primary/20">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-base font-normal leading-relaxed text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-4">
        <Link href={href}>
          <button className="w-full flex items-center justify-center gap-2 rounded-lg h-12 bg-primary text-white text-base font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
            <span>{buttonText}</span>
            <ArrowForward className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Link>
      </div>
    </div>
  );
}
