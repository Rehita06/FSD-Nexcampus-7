import { useState } from 'react';
import { BellRing, BellOff, Send, Sun } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import type { Theme } from '@/types';

interface PreferencesPanelProps {
  theme: Theme;
  onToggleTheme: () => void;
}

type PermissionState = NotificationPermission | 'unsupported';

function readPermission(): PermissionState {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

export default function PreferencesPanel({ theme, onToggleTheme }: PreferencesPanelProps) {
  const [permission, setPermission] = useState<PermissionState>(readPermission);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const sendTest = () => {
    new Notification('NexCampus notifications are on', { body: 'You will be alerted when a focus session ends.' });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <Sun className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Appearance</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Saved on this device</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">{theme === 'dark' ? 'Dark theme' : 'Light theme'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Easier on the eyes at night</p>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            <BellRing className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Browser notifications</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Focus session alerts</p>
          </div>
        </div>

        {permission === 'unsupported' && (
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <BellOff className="h-4 w-4" /> Notifications are not supported by this browser.
          </p>
        )}
        {permission === 'granted' && (
          <div className="space-y-3">
            <p className="rounded-xl bg-brand-50 p-4 text-sm font-medium text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">Notifications are on.</p>
            <button onClick={sendTest} className="btn-secondary w-full">
              <Send className="h-4 w-4" /> Send a test notification
            </button>
          </div>
        )}
        {permission === 'default' && (
          <button onClick={requestPermission} className="btn-primary w-full">
            <BellRing className="h-4 w-4" /> Turn on notifications
          </button>
        )}
        {permission === 'denied' && (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            Notifications are blocked. Allow them for this site in your browser settings to receive alerts.
          </p>
        )}
      </section>
    </div>
  );
}
