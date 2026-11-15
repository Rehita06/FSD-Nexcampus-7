import { useState } from 'react';
import { Compass, Map as MapIcon, Settings2, Timer } from 'lucide-react';
import CampusMap from '@/components/tools/CampusMap';
import FindMyCampus from '@/components/tools/FindMyCampus';
import FocusTimer from '@/components/tools/FocusTimer';
import PreferencesPanel from '@/components/tools/PreferencesPanel';
import type { Theme } from '@/types';

interface ToolsPageProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const TABS = [
  { id: 'focus', label: 'Focus timer', icon: Timer },
  { id: 'map', label: 'Campus map', icon: MapIcon },
  { id: 'find', label: 'Find my campus', icon: Compass },
  { id: 'preferences', label: 'Preferences', icon: Settings2 },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ToolsPage({ theme, onToggleTheme }: ToolsPageProps) {
  const [tab, setTab] = useState<TabId>('focus');

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Campus Tools</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Practical extras to help you study, get around and personalise NexCampus.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Campus tools"
        className="mb-8 flex gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-900"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === item.id
                ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div key={tab} role="tabpanel" className="animate-fade-in">
        {tab === 'focus' && <FocusTimer />}
        {tab === 'map' && <CampusMap />}
        {tab === 'find' && <FindMyCampus />}
        {tab === 'preferences' && <PreferencesPanel theme={theme} onToggleTheme={onToggleTheme} />}
      </div>
    </div>
  );
}
