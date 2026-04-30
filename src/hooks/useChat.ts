import { useState, useCallback } from 'react';
import type { Message, Mode } from '../types';
import { RateLimitError } from '../types';
import { sendMessage } from '../utils/api';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface UseChatOptions {
  mode: Mode;
  messages: Message[];
  onUserMessage: (message: Message) => void;
  onAssistantMessage: (message: Message) => void;
  ensureConversation: () => void;
}

export function useChat({
  mode,
  messages,
  onUserMessage,
  onAssistantMessage,
  ensureConversation,
}: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    active: boolean;
    retryAfter: number;
  }>({ active: false, retryAfter: 0 });

  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      ensureConversation();

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      onUserMessage(userMessage);

      const allMessages = [...messages, userMessage];

      setIsLoading(true);

      try {
        const response = await sendMessage(mode, allMessages);

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };

        onAssistantMessage(assistantMessage);
      } catch (err) {
        if (err instanceof RateLimitError) {
          setRateLimitInfo({ active: true, retryAfter: err.retryAfter });
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [mode, messages, isLoading, onUserMessage, onAssistantMessage, ensureConversation]
  );

  const dismissRateLimit = useCallback(() => {
    setRateLimitInfo({ active: false, retryAfter: 0 });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    rateLimitInfo,
    send,
    dismissRateLimit,
    clearError,
  };
}
