import { Moon, Sun } from 'lucide-react';
import type { Theme } from '@/types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="relative inline-flex h-9 w-16 items-center rounded-full border border-slate-300 bg-slate-100 p-1 transition hover:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-white text-amber-500 shadow transition-transform duration-300 dark:bg-slate-950 dark:text-sky-300 ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  );
}
