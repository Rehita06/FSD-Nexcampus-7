import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, Eraser, Send, Sparkles } from 'lucide-react';
import ChatBubble from '@/components/ChatBubble';
import { answerQuestion, SUGGESTED_QUESTIONS } from '@/lib/chatEngine';
import type { CampusRecord, ChatMessage } from '@/types';

interface ChatPageProps {
  records: CampusRecord[];
  messages: ChatMessage[];
  setMessages: (update: (prev: ChatMessage[]) => ChatMessage[]) => void;
}

const TYPING_DELAY_MS = 700;

export default function ChatPage({ records, messages, setMessages }: ChatPageProps) {
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing]);

  const send = (text: string) => {
    const question = text.trim();
    if (!question || typing) return;

    const lastCategory = [...messages].reverse().find((m) => m.role === 'bot' && m.category)?.category;
    const reply = answerQuestion(question, records, { lastCategory });
    const now = new Date().toISOString();

    setMessages((prev) => [...prev, { id: `u-${now}`, role: 'user', text: question, timestamp: now }]);
    setInput('');
    setTyping(true);

    timerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${new Date().toISOString()}`,
          role: 'bot',
          text: reply.text,
          category: reply.category,
          sourceTitles: reply.sourceTitles,
          office: reply.office,
          timestamp: new Date().toISOString(),
        },
      ]);
      setTyping(false);
    }, TYPING_DELAY_MS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(input);
  };

  const clearChat = () => {
    if (window.confirm('Clear this conversation? This cannot be undone.')) {
      window.clearTimeout(timerRef.current);
      setTyping(false);
      setMessages(() => []);
    }
  };

  return (
    <div className="animate-fade-in mx-auto flex max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ask NexCampus</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Ask in your own words. Follow-up questions like "tell me more" use the topic we were just discussing.
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-secondary shrink-0 !px-3 !py-2 text-sm" aria-label="Clear conversation">
            <Eraser className="h-4 w-4" /> <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </header>

      <div className="card flex min-h-[28rem] flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {messages.length === 0 && !typing && (
            <div className="animate-fade-in flex flex-col items-center py-6 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
                <Sparkles className="h-7 w-7" />
              </span>
              <p className="max-w-md text-slate-700 dark:text-slate-200">
                Hi, I am NexCampus. Ask me about attendance, leave, hostel rules, the library, ID cards, exams, discipline or scholarships.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-800 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-sm dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {typing && (
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 dark:bg-slate-800" aria-label="NexCampus is typing">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-slate-500 animate-bounce-dot dark:bg-slate-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length > 0 && messages[messages.length - 1].role === 'bot' && !typing && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 pt-3 dark:border-slate-800 sm:px-6">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-brand-100 hover:text-brand-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-900/40 dark:hover:text-brand-200"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 p-4 dark:border-slate-800 sm:p-5">
          <label htmlFor="chat-input" className="sr-only">Type your question</label>
          <input
            id="chat-input"
            className="input"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            autoComplete="off"
          />
          <button type="submit" className="btn-primary shrink-0 !px-4" disabled={!input.trim() || typing} aria-label="Send question">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <Building2 className="h-3.5 w-3.5" />
        If NexCampus cannot find a reliable answer, it will direct you to the right college office.
      </p>
    </div>
  );
}
