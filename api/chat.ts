import type { VercelRequest, VercelResponse } from '@vercel/node';

const TINKROW_API_URL = 'https://base.tinkrow.space/api/chat/v1/chat/completions';
const API_KEY = process.env.TINKROW_API_KEY;

export const maxDuration = 60; // Allow function to run for up to 60 seconds

const MODE_CONFIG = {
  excel: {
    model: 'vertex_ai/qwen/qwen3-coder-480b-a35b-instruct-maas',
    systemPrompt:
      'Kamu adalah NaoGPT, ahli formula Excel dan Google Sheets. Berikan HANYA rumus yang tepat dalam format markdown code block, diikuti maksimal 2 kalimat penjelasan. Dilarang basa-basi.',
  },
  chat: {
    model: 'vertex_ai/zai-org/glm-4.7-maas',
    systemPrompt:
      'Nama kamu adalah NaoGPT, asisten AI cerdas yang dibuat oleh Rashya Adithiya. Jawab dengan ramah, informatif, dan sopan.',
  },
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured in Vercel' });
  }

  const { mode, messages } = req.body as {
    mode: 'chat' | 'excel';
    messages: { role: string; content: string }[];
  };

  if (!mode || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const config = MODE_CONFIG[mode];
  if (!config) {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  const apiMessages = [
    { role: 'system', content: config.systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch(TINKROW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        model: config.model,
        messages: apiMessages,
        temperature: mode === 'excel' ? 0.3 : 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Tinkrow API error:', response.status, errorBody);
      return res.status(response.status).json({
        error: `Upstream API error: ${response.status}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
