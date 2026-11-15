import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from '@/components/ToastProvider';
import { STORAGE_KEYS } from '@/constants';
import './index.css';

function applyStoredTheme() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.theme) ?? '"light"');
    document.documentElement.classList.toggle('dark', stored === 'dark');
  } catch {
    document.documentElement.classList.remove('dark');
  }
}

applyStoredTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
