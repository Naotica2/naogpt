export type Mode = 'chat' | 'excel';

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  textContent: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachment?: FileAttachment;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  mode: Mode;
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequest {
  mode: Mode;
  messages: { role: string; content: string }[];
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ApiError {
  error: string;
  retryAfter?: number;
}

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number = 60) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
