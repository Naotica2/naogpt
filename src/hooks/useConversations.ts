import { useState, useCallback, useEffect, useRef } from 'react';
import type { Conversation, Message, Mode } from '../types';
import {
  getConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
} from '../utils/storage';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useConversations(mode: Mode) {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getConversations(mode)
  );

  const [activeId, setActiveId] = useState<string | null>(() =>
    getActiveConversationId(mode)
  );

  const activeIdRef = useRef<string | null>(activeId);

  // Re-load when mode changes
  useEffect(() => {
    const convs = getConversations(mode);
    setConversations(convs);
    const savedActive = getActiveConversationId(mode);
    setActiveId(savedActive);
    activeIdRef.current = savedActive;
  }, [mode]);

  const persist = useCallback(
    (convs: Conversation[]) => {
      setConversations(convs);
      saveConversations(mode, convs);
    },
    [mode]
  );

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const createConversation = useCallback((): Conversation => {
    const conv: Conversation = {
      id: generateId(),
      title: 'New conversation',
      messages: [],
      mode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // Need to use functional update to ensure we don't have stale conversations state
    setConversations((prev) => {
      const updated = [conv, ...prev];
      saveConversations(mode, updated);
      return updated;
    });
    
    setActiveId(conv.id);
    activeIdRef.current = conv.id;
    setActiveConversationId(mode, conv.id);
    return conv;
  }, [mode]);

  const selectConversation = useCallback(
    (id: string) => {
      setActiveId(id);
      activeIdRef.current = id;
      setActiveConversationId(mode, id);
    },
    [mode]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveConversations(mode, updated);
        
        if (activeIdRef.current === id) {
          const newActive = updated.length > 0 ? updated[0].id : null;
          setActiveId(newActive);
          activeIdRef.current = newActive;
          setActiveConversationId(mode, newActive);
        }
        return updated;
      });
    },
    [mode]
  );

  const addMessage = useCallback(
    (message: Message) => {
      setConversations((prev) => {
        const targetId = activeIdRef.current;
        const updated = prev.map((c) => {
          if (c.id !== targetId) return c;
          const messages = [...c.messages, message];
          const title =
            c.messages.length === 0 && message.role === 'user'
              ? message.content.slice(0, 50) + (message.content.length > 50 ? '…' : '')
              : c.title;
          return { ...c, messages, title, updatedAt: Date.now() };
        });
        saveConversations(mode, updated);
        return updated;
      });
    },
    [mode]
  );

  const clearActive = useCallback(() => {
    setActiveId(null);
    activeIdRef.current = null;
    setActiveConversationId(mode, null);
  }, [mode]);

  return {
    conversations,
    activeConversation,
    activeId,
    createConversation,
    selectConversation,
    deleteConversation,
    addMessage,
    clearActive,
  };
}
