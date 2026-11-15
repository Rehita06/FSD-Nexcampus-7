import { useEffect, useState } from 'react';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStored(key, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be full or disabled; the in-memory value still works for this session.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
