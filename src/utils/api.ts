import type { Message, Mode, ApiError } from '../types';
import { RateLimitError } from '../types';

export async function sendMessage(
  mode: Mode,
  messages: Message[],
  onChunk?: (chunk: string) => void
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
    const bodyText = await res.text();
    let errorMessage = `API error: ${res.status}`;
    try {
      const body = JSON.parse(bodyText) as ApiError;
      errorMessage = body.error || errorMessage;
    } catch (e) {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder('utf-8');
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim() === '') continue;
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6);
        if (dataStr === '[DONE]') continue;

        try {
          const data = JSON.parse(dataStr);
          const chunkContent = data.choices?.[0]?.delta?.content;
          if (chunkContent) {
            fullContent += chunkContent;
            if (onChunk) onChunk(chunkContent);
          }
        } catch (e) {
          console.error('Error parsing stream chunk:', e);
        }
      }
    }
  }

  return fullContent;
}
