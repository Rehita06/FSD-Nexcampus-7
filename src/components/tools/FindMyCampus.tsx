import { useState } from 'react';
import { Info, LocateFixed, MapPin, Navigation, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/constants';
import { compassDirection, distanceMeters, formatDistance } from '@/lib/geo';
import type { SavedCampusLocation } from '@/types';

const ON_CAMPUS_RADIUS_M = 300;

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Location is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      reject(
        new Error(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Allow location access in your browser settings and try again.'
            : 'Your location could not be determined. Please try again.',
        ),
      );
    }, { enableHighAccuracy: true, timeout: 15000 });
  });
}

type Status = { kind: 'idle' } | { kind: 'busy'; message: string } | { kind: 'error'; message: string } | { kind: 'result'; message: string; onCampus: boolean };

export default function FindMyCampus() {
  const [saved, setSaved] = useLocalStorage<SavedCampusLocation | null>(STORAGE_KEYS.campus, null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const saveCurrentAsCampus = async () => {
    setStatus({ kind: 'busy', message: 'Getting your location...' });
    try {
      const position = await getPosition();
      setSaved({ lat: position.coords.latitude, lng: position.coords.longitude, savedAt: new Date().toISOString() });
      setStatus({ kind: 'result', message: 'This spot is now saved as your campus. Use "Find my campus" when you return.', onCampus: true });
    } catch (error) {
      setStatus({ kind: 'error', message: (error as Error).message });
    }
  };

  const findMyCampus = async () => {
    if (!saved) return;
    setStatus({ kind: 'busy', message: 'Checking where you are...' });
    try {
      const position = await getPosition();
      const { latitude, longitude } = position.coords;
      const meters = distanceMeters(latitude, longitude, saved.lat, saved.lng);
      const direction = compassDirection(latitude, longitude, saved.lat, saved.lng);
      if (meters <= ON_CAMPUS_RADIUS_M) {
        setStatus({ kind: 'result', message: 'You are on campus. Your saved campus location is right here.', onCampus: true });
      } else {
        setStatus({
          kind: 'result',
          message: `You are about ${formatDistance(meters)} away from your saved campus. Head ${direction.toLowerCase()} to get back.`,
          onCampus: false,
        });
      }
    } catch (error) {
      setStatus({ kind: 'error', message: (error as Error).message });
    }
  };

  const clearSaved = () => {
    setSaved(null);
    setStatus({ kind: 'idle' });
  };

  const busy = status.kind === 'busy';

  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
          <LocateFixed className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Find My Campus</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Save your campus location once, then check how far you are from it at any time. Your location stays on this device.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={saveCurrentAsCampus} disabled={busy} className="btn-secondary">
          <MapPin className="h-4 w-4" /> {saved ? 'Update saved campus' : 'Save this spot as my campus'}
        </button>
        <button onClick={findMyCampus} disabled={busy || !saved} className="btn-primary">
          <Navigation className="h-4 w-4" /> Find my campus
        </button>
      </div>

      <div className="mt-6" aria-live="polite">
        {status.kind === 'busy' && <p className="animate-pulse text-sm text-slate-500 dark:text-slate-400">{status.message}</p>}
        {status.kind === 'error' && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{status.message}</p>
        )}
        {status.kind === 'result' && (
          <p
            className={`animate-pop-in rounded-xl px-4 py-3 text-sm font-medium ${
              status.onCampus
                ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200'
                : 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200'
            }`}
          >
            {status.message}
          </p>
        )}
      </div>

      {saved ? (
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Saved on {new Date(saved.savedAt).toLocaleDateString()} at {saved.lat.toFixed(4)}, {saved.lng.toFixed(4)}
          </p>
          <button onClick={clearSaved} className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-rose-600 hover:underline dark:text-rose-400">
            <Trash2 className="h-4 w-4" /> Remove saved campus
          </button>
        </div>
      ) : (
        <p className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <Info className="h-3.5 w-3.5" /> No campus saved yet. Stand at your campus gate and save the spot first.
        </p>
      )}
    </div>
  );
}
