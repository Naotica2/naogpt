import { Moon, Sun, Menu, MessageSquare, TableProperties } from 'lucide-react';
import type { Mode } from '../types';

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export function Header({
  mode,
  onModeChange,
  theme,
  onToggleTheme,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-14 px-4 sm:px-6 bg-transparent">
      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-4 w-1/3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 transition-all active:scale-95 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl shadow-lg shadow-indigo-500/10 overflow-hidden shrink-0 border border-neutral-200/50 dark:border-neutral-700/50">
            <img src="/logo.png" alt="NaoGPT" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 hidden sm:block">
            NaoGPT
          </h1>
        </div>
      </div>

      {/* Center: Modern Animated Mode Switcher */}
      <div className="flex justify-center w-1/3">
        <div className="relative flex items-center bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl p-1 border border-neutral-200/50 dark:border-neutral-800/50 shadow-inner">
          {/* Sliding Background */}
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700/50 transition-transform duration-300 ease-out"
            style={{ transform: mode === 'excel' ? 'translateX(100%)' : 'translateX(0)' }}
          />

          <button
            onClick={() => onModeChange('chat')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors duration-300 ${
              mode === 'chat'
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <MessageSquare size={16} strokeWidth={2.5} className={mode === 'chat' ? 'text-indigo-500 dark:text-indigo-400' : ''} />
            <span className="hidden sm:inline">Chat</span>
          </button>
          
          <button
            onClick={() => onModeChange('excel')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors duration-300 ${
              mode === 'excel'
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <TableProperties size={16} strokeWidth={2.5} className={mode === 'excel' ? 'text-emerald-500 dark:text-emerald-400' : ''} />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Right: theme toggle */}
      <div className="flex justify-end w-1/3">
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
        </button>
      </div>
    </header>
  );
}
