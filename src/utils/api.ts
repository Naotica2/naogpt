import type { Message, Mode, ChatResponse, ApiError } from '../types';
import { RateLimitError } from '../types';

export async function sendMessage(
  mode: Mode,
  messages: Message[]
): Promise<string> {
  const apiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, messages: apiMessages }),
  });

  if (res.status === 429) {
    const body = (await res.json()) as ApiError;
    throw new RateLimitError(body.retryAfter || 60);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: 'Unknown error' }))) as ApiError;
    throw new Error(body.error || `API error: ${res.status}`);
  }

  const data = (await res.json()) as ChatResponse;
  return data.choices[0].message.content;
}
