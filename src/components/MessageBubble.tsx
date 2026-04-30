import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import type { Message as MessageType } from '../types';

interface MessageBubbleProps {
  message: MessageType;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-fade-in-up`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] rounded-3xl px-5 py-4 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-md shadow-indigo-500/20'
            : 'bg-white dark:bg-neutral-800/90 border border-neutral-100 dark:border-neutral-700/50 text-neutral-900 dark:text-neutral-100 rounded-bl-md shadow-neutral-200/40 dark:shadow-none'
        }`}
      >
        {isUser ? (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-[15px] leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !className;

                  if (isInline) {
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700/50 text-[13px] font-mono text-indigo-600 dark:text-indigo-400 before:hidden after:hidden"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <CodeBlock language={match?.[1]}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  );
                },
                pre({ children }) {
                  return <div className="not-prose my-4">{children}</div>;
                },
                p({ children }) {
                  return <p className="mb-4 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>;
                },
                li({ children }) {
                  return <li className="pl-1">{children}</li>;
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-500 transition-colors"
                    >
                      {children}
                    </a>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                      <table className="min-w-full text-sm border-collapse m-0">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/80 text-left font-semibold text-neutral-900 dark:text-neutral-100">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="border-b border-neutral-100 dark:border-neutral-800/50 px-4 py-3 last:border-0">
                      {children}
                    </td>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ children, language }: { children: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-700/80 shadow-sm bg-neutral-50 dark:bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-100/80 dark:bg-neutral-800 border-b border-neutral-200/80 dark:border-neutral-700/80">
        <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 -mr-2 rounded-md text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-neutral-800 dark:text-neutral-300">
        <code>{children}</code>
      </pre>
    </div>
  );
}
