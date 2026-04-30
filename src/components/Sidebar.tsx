import { Plus, MessageSquare, Trash2, X, Clock } from 'lucide-react';
import type { Conversation, Mode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  mode: Mode;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeId,
  mode,
  onSelect,
  onDelete,
  onNewChat,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in-up"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-xl border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header area */}
        <div className="flex items-center justify-between p-4 pt-5">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            {mode === 'chat' ? 'Chat' : 'Excel'} History
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors lg:hidden active:scale-95"
            aria-label="Close sidebar"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 pb-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            New conversation
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-neutral-400 dark:text-neutral-500 opacity-60">
              <MessageSquare size={32} strokeWidth={1.5} className="mb-3" />
              <p className="text-sm font-medium">No conversations yet</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conv) => (
                <li key={conv.id} className="group">
                  <div
                    onClick={() => {
                      onSelect(conv.id);
                      onClose();
                    }}
                    role="button"
                    tabIndex={0}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-start justify-between gap-3 cursor-pointer border border-transparent ${
                      activeId === conv.id
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm border-neutral-200/50 dark:border-neutral-700/50'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{conv.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                        <Clock size={12} />
                        <span>{formatTime(conv.updatedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all shrink-0 -mr-1"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 text-center">
            Built by Naotica
          </p>
        </div>
      </aside>
    </>
  );
}
