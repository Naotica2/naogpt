import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { ChatInput } from './components/ChatInput';
import { RateLimitToast } from './components/RateLimitToast';
import { useTheme } from './hooks/useTheme';
import { useConversations } from './hooks/useConversations';
import { useChat } from './hooks/useChat';
import { getMode, setMode as saveMode } from './utils/storage';
import type { Mode } from './types';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [mode, setModeState] = useState<Mode>(() => getMode());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    conversations,
    activeConversation,
    activeId,
    createConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    updateMessage,
    clearActive,
  } = useConversations(mode);

  const ensureConversation = useCallback(() => {
    if (!activeConversation) {
      createConversation();
    }
  }, [activeConversation, createConversation]);

  const {
    isLoading,
    error,
    rateLimitInfo,
    send,
    dismissRateLimit,
    clearError,
  } = useChat({
    mode,
    messages: activeConversation?.messages || [],
    onUserMessage: addMessage,
    onAssistantMessage: addMessage,
    onAssistantMessageUpdate: updateMessage,
    ensureConversation,
  });

  const handleModeChange = useCallback(
    (newMode: Mode) => {
      if (newMode === mode) return;
      setModeState(newMode);
      saveMode(newMode);
    },
    [mode]
  );

  const handleNewChat = useCallback(() => {
    clearActive();
  }, [clearActive]);

  return (
    <div className="h-dvh flex overflow-hidden bg-white dark:bg-neutral-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        mode={mode}
        onSelect={selectConversation}
        onDelete={deleteConversation}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header
          mode={mode}
          onModeChange={handleModeChange}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatView
            messages={activeConversation?.messages || []}
            mode={mode}
            isLoading={isLoading}
            error={error}
            onClearError={clearError}
          />
          <ChatInput mode={mode} onSend={send} isLoading={isLoading} />
        </div>
      </main>

      <RateLimitToast
        active={rateLimitInfo.active}
        retryAfter={rateLimitInfo.retryAfter}
        onDismiss={dismissRateLimit}
      />
    </div>
  );
}

export default App;
