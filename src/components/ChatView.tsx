import { useEffect, useRef } from 'react';
import { MessageSquare, TableProperties, Sparkles, X } from 'lucide-react';
import type { Message, Mode } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatViewProps {
  messages: Message[];
  mode: Mode;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

const WELCOME = {
  chat: {
    title: 'NaoGPT',
    subtitle: 'Your intelligent AI assistant. Ask me anything, from code to creative writing.',
    icon: MessageSquare,
    color: 'from-indigo-500/20 to-purple-500/20',
    iconColor: 'text-indigo-500 dark:text-indigo-400',
  },
  excel: {
    title: 'Excel & Sheets',
    subtitle: 'Describe the problem you are trying to solve, and I will generate the exact formula.',
    icon: TableProperties,
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
};

export function ChatView({ messages, mode, isLoading, error, onClearError }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const welcome = WELCOME[mode];
  const Icon = welcome.icon;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 min-h-full flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in-up">
            <div className={`relative p-8 rounded-3xl glass text-center max-w-md w-full overflow-hidden`}>
              {/* Decorative gradient blob */}
              <div className={`absolute -inset-10 bg-gradient-to-br ${welcome.color} blur-3xl opacity-50 dark:opacity-30 rounded-full`} />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl border border-neutral-100 dark:border-neutral-700 flex items-center justify-center mb-6 relative overflow-hidden">
                  <Icon size={32} strokeWidth={2} className={welcome.iconColor} />
                  <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-3">
                  {welcome.title}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                  {welcome.subtitle}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start mb-4 animate-fade-in-up">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-indigo-500/80 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-indigo-500/80 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-indigo-500/80 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center mb-4 animate-slide-in">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800/50 shadow-sm backdrop-blur-sm">
              <span className="font-medium">{error}</span>
              <button 
                onClick={onClearError} 
                className="ml-1 p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors"
                aria-label="Clear error"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
