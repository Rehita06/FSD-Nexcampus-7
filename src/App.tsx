import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCampusRecords } from '@/hooks/useCampusRecords';
import { useHashRoute } from '@/hooks/useHashRoute';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/constants';
import AdminPage from '@/pages/AdminPage';
import CampusHubPage from '@/pages/CampusHubPage';
import ChatPage from '@/pages/ChatPage';
import HomePage from '@/pages/HomePage';
import StudentsPage from '@/pages/StudentsPage';
import ToolsPage from '@/pages/ToolsPage';
import { ErrorState, LoadingState, PageShell } from '@/components/DataState';
import type { ChatMessage, Theme } from '@/types';

function App() {
  const { route, navigate } = useHashRoute();
  const [theme, setTheme] = useLocalStorage<Theme>(STORAGE_KEYS.theme, 'light');
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(STORAGE_KEYS.chat, []);
  const { records, status, error, refresh, addRecord, updateRecord, deleteRecord, resetRecords } = useCampusRecords();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const needsRecords = route === 'chat' || route === 'hub' || route === 'admin';

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="flex min-h-screen flex-col">
      <div className="ambient" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>

      <Navbar route={route} onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1">
        {route === 'home' && <HomePage records={records} status={status} onNavigate={navigate} />}
        {needsRecords && status === 'loading' && (
          <PageShell>
            <LoadingState label="Loading campus records…" />
          </PageShell>
        )}
        {needsRecords && status === 'error' && (
          <PageShell>
            <ErrorState title="Could not load campus records" message={error} onRetry={() => void refresh()} />
          </PageShell>
        )}
        {route === 'chat' && status === 'ready' && <ChatPage records={records} messages={messages} setMessages={setMessages} />}
        {route === 'hub' && status === 'ready' && <CampusHubPage records={records} />}
        {route === 'tools' && <ToolsPage theme={theme} onToggleTheme={toggleTheme} />}
        {route === 'students' && <StudentsPage />}
        {route === 'admin' && status === 'ready' && (
          <AdminPage
            records={records}
            onAdd={addRecord}
            onUpdate={updateRecord}
            onDelete={deleteRecord}
            onReset={resetRecords}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        NexCampus. Guidance is for information only. Confirm final decisions with your college office.
      </footer>
    </div>
  );
}

export default App;
