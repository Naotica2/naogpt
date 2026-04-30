import type { Conversation, Mode } from '../types';

const STORAGE_KEYS: Record<Mode, string> = {
  excel: 'naogpt_history_excel',
  chat: 'naogpt_history_chat',
};

const ACTIVE_CONVERSATION_KEYS: Record<Mode, string> = {
  excel: 'naogpt_active_excel',
  chat: 'naogpt_active_chat',
};

const THEME_KEY = 'naogpt_theme';
const MODE_KEY = 'naogpt_mode';

export function getConversations(mode: Mode): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[mode]);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

export function saveConversations(mode: Mode, conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(conversations));
}

export function getActiveConversationId(mode: Mode): string | null {
  return localStorage.getItem(ACTIVE_CONVERSATION_KEYS[mode]);
}

export function setActiveConversationId(mode: Mode, id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_CONVERSATION_KEYS[mode], id);
  } else {
    localStorage.removeItem(ACTIVE_CONVERSATION_KEYS[mode]);
  }
}

export function getTheme(): 'dark' | 'light' | null {
  return localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
}

export function setTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function getMode(): Mode {
  return (localStorage.getItem(MODE_KEY) as Mode) || 'chat';
}

export function setMode(mode: Mode): void {
  localStorage.setItem(MODE_KEY, mode);
}
