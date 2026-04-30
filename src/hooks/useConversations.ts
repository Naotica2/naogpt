import { useState, useCallback, useEffect } from 'react';
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

  // Re-load when mode changes
  useEffect(() => {
    const convs = getConversations(mode);
    setConversations(convs);
    const savedActive = getActiveConversationId(mode);
    setActiveId(savedActive);
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
    const updated = [conv, ...conversations];
    persist(updated);
    setActiveId(conv.id);
    setActiveConversationId(mode, conv.id);
    return conv;
  }, [conversations, mode, persist]);

  const selectConversation = useCallback(
    (id: string) => {
      setActiveId(id);
      setActiveConversationId(mode, id);
    },
    [mode]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      const updated = conversations.filter((c) => c.id !== id);
      persist(updated);
      if (activeId === id) {
        const newActive = updated.length > 0 ? updated[0].id : null;
        setActiveId(newActive);
        setActiveConversationId(mode, newActive);
      }
    },
    [conversations, activeId, mode, persist]
  );

  const addMessage = useCallback(
    (message: Message) => {
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== activeId) return c;
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
    [activeId, mode]
  );

  const clearActive = useCallback(() => {
    setActiveId(null);
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
