import { useState } from 'react';
import { GraduationCap, Menu, Moon, Sun, X } from 'lucide-react';
import { ROUTES } from '@/constants';
import ThemeToggle from '@/components/ThemeToggle';
import type { Route, Theme } from '@/types';

interface NavbarProps {
  route: Route;
  onNavigate: (route: Route) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Navbar({ route, onNavigate, theme, onToggleTheme }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const go = (next: Route) => {
    onNavigate(next);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={() => go('home')} className="flex items-center gap-2.5 transition hover:opacity-80">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-left">
            <span className="block text-lg font-bold leading-tight text-slate-900 dark:text-white">NexCampus</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">Student guidance</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {ROUTES.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                route === item.id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="ml-2">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-fade-in border-t border-slate-200 px-4 pb-4 pt-2 md:hidden dark:border-slate-800" aria-label="Mobile">
          {ROUTES.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                route === item.id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
