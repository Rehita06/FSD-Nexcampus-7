import { Building2 } from 'lucide-react';
import type { ChatMessage } from '@/types';

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`animate-fade-in flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-br-md bg-brand-600 text-white'
              : 'rounded-bl-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
          }`}
        >
          {message.text}
        </div>

        {!isUser && message.sourceTitles && message.sourceTitles.length > 0 && (
          <p className="px-1 text-xs text-slate-500 dark:text-slate-400">Source: {message.sourceTitles.join(', ')}</p>
        )}

        {!isUser && message.office && (
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
            <Building2 className="h-3.5 w-3.5" /> Contact: {message.office}
          </p>
        )}

        <span className="px-1 text-[11px] text-slate-400 dark:text-slate-500">{time}</span>
      </div>
    </div>
  );
}
