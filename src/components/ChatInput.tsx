import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';
import type { Mode } from '../types';

interface ChatInputProps {
  mode: Mode;
  onSend: (content: string) => void;
  isLoading: boolean;
}

const PLACEHOLDERS: Record<Mode, string> = {
  chat: 'Ask NaoGPT anything...',
  excel: 'Describe the formula you need...',
};

export function ChatInput({ mode, onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gradient-to-t from-white via-white to-white/0 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950/0 p-4 pt-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl p-2 shadow-lg shadow-neutral-200/50 dark:shadow-none focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDERS[mode]}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none py-2.5 px-3 max-h-40 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className={`shrink-0 p-2.5 rounded-xl text-white transition-all active:scale-95 ${
              !value.trim() || isLoading 
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20'
            }`}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <SendHorizontal size={18} strokeWidth={2.5} className={value.trim() ? "translate-x-0.5" : ""} />
            )}
          </button>
        </div>
        <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 text-center mt-3">
          NaoGPT can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
