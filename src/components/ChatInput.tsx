import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { SendHorizontal, Loader2, Paperclip, X, FileText, FileCode } from 'lucide-react';
import type { Mode, FileAttachment } from '../types';
import { processFile, getSupportedFileTypes, formatFileSize, isFileSupported } from '../utils/fileProcessor';

interface ChatInputProps {
  mode: Mode;
  onSend: (content: string, attachment?: FileAttachment) => void;
  isLoading: boolean;
}

const PLACEHOLDERS: Record<Mode, string> = {
  chat: 'Ask NaoGPT anything...',
  excel: 'Describe the formula you need...',
};

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'c', 'cpp', 'go', 'rs', 'rb', 'php', 'swift', 'kt', 'html', 'css', 'scss', 'sql', 'vue', 'svelte'];
  if (codeExts.includes(ext)) return FileCode;
  return FileText;
}

export function ChatInput({ mode, onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if ((!value.trim() && !attachment) || isLoading || isProcessing) return;
    onSend(value, attachment || undefined);
    setValue('');
    setAttachment(null);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = '';

    if (!isFileSupported(file)) {
      setFileError('Tipe file tidak didukung');
      setTimeout(() => setFileError(null), 3000);
      return;
    }

    setIsProcessing(true);
    setFileError(null);

    try {
      const processed = await processFile(file);
      setAttachment(processed);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Gagal memproses file');
      setTimeout(() => setFileError(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const Icon = attachment ? getFileIcon(attachment.name) : FileText;
  const canSend = (value.trim() || attachment) && !isLoading && !isProcessing;

  return (
    <div className="bg-gradient-to-t from-white via-white to-white/0 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950/0 p-4 pt-6">
      <div className="max-w-5xl mx-auto">
        {/* File attachment preview */}
        {attachment && (
          <div className="mb-2 flex items-center gap-3 px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl animate-fade-in-up">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{attachment.name}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{formatFileSize(attachment.size)}</p>
            </div>
            <button
              onClick={removeAttachment}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all active:scale-95 shrink-0"
              aria-label="Remove attachment"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* File error */}
        {fileError && (
          <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400 animate-fade-in-up">
            {fileError}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl p-2 shadow-lg shadow-neutral-200/50 dark:shadow-none focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 transition-all">
          {/* Attach button */}
          <input
            ref={fileInputRef}
            type="file"
            accept={getSupportedFileTypes()}
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Attach file"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isProcessing}
            className="shrink-0 p-2.5 rounded-xl text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Attach file"
            title="Lampirkan file (teks, kode, PDF)"
          >
            {isProcessing ? (
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <Paperclip size={18} strokeWidth={2.5} />
            )}
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDERS[mode]}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none py-2.5 px-1 max-h-40 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={`shrink-0 p-2.5 rounded-xl text-white transition-all active:scale-95 ${
              !canSend 
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20'
            }`}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <SendHorizontal size={18} strokeWidth={2.5} className={canSend ? "translate-x-0.5" : ""} />
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
