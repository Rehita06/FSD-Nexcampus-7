import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/constants';

const PRESET_MINUTES = [15, 25, 45];
const RING_RADIUS = 92;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = (safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function notifySessionComplete(minutes: number) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification('Focus session complete', { body: `Great work. You focused for ${minutes} minutes. Take a short break.` });
}

export default function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useLocalStorage<number>(STORAGE_KEYS.focusSessions, 0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remaining <= 0) {
      setRunning(false);
      setCompleted((c) => c + 1);
      notifySessionComplete(minutes);
    }
  }, [running, remaining, minutes, setCompleted]);

  const total = minutes * 60;
  const progress = Math.min(1, Math.max(0, (total - remaining) / total));

  const choosePreset = (value: number) => {
    setMinutes(value);
    setRemaining(value * 60);
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(total);
  };

  return (
    <div className="card mx-auto flex max-w-md flex-col items-center p-6 sm:p-8">
      <div className="mb-6 flex gap-2" role="group" aria-label="Session length">
        {PRESET_MINUTES.map((value) => (
          <button
            key={value}
            onClick={() => choosePreset(value)}
            disabled={running}
            aria-pressed={minutes === value}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
              minutes === value
                ? 'bg-brand-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {value} min
          </button>
        ))}
      </div>

      <div className="relative flex h-56 w-56 items-center justify-center">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r={RING_RADIUS} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-800" />
          <circle
            cx="100"
            cy="100"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className="stroke-brand-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <div className="text-center">
          <p className="font-mono text-5xl font-bold tabular-nums text-slate-900 dark:text-white" aria-live="off">
            {formatTime(remaining)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {running ? 'Stay focused' : remaining === 0 ? 'Session complete' : 'Ready to focus'}
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => (running ? setRunning(false) : setRunning(remaining > 0))}
          className="btn-primary min-w-32"
          disabled={remaining === 0 && !running}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="btn-secondary">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Timer className="h-4 w-4" /> Sessions completed: <span className="font-semibold text-slate-800 dark:text-slate-200">{completed}</span>
      </p>
    </div>
  );
}
