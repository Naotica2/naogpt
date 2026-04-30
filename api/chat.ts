export const config = {
  runtime: 'edge',
};

const TINKROW_API_URL = 'https://base.tinkrow.space/api/chat/v1/chat/completions';
const API_KEY = process.env.TINKROW_API_KEY;

const MODE_CONFIG = {
  excel: {
    model: 'vertex_ai/qwen/qwen3-coder-480b-a35b-instruct-maas',
    systemPrompt:
      'Kamu adalah NaoGPT, asisten ahli pembuat rumus Excel dan Google Sheets. Jika pengguna meminta rumus, berikan rumus yang paling tepat dan efisien dalam format markdown code block (```excel), diikuti dengan penjelasan singkat yang mudah dipahami (maksimal 2-3 kalimat). Jika pengguna hanya menyapa, mengobrol, bertanya, atau mengonfirmasi (bukan meminta rumus baru), jawablah dengan natural, responsif, dan ramah seperti manusia tanpa memaksakan memberikan rumus. Hindari memberikan rumus jika tidak relevan dengan konteks percakapan saat itu.',
  },
  chat: {
    model: 'vertex_ai/zai-org/glm-4.7-maas',
    systemPrompt:
      'Nama kamu adalah NaoGPT, asisten AI cerdas yang dibuat oleh Rashya Adithiya. Jawab dengan ramah, informatif, dan sopan.',
  },
} as const;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured in Vercel' }), { status: 500 });
  }

  try {
    const body = await req.json();
    const { mode, messages } = body as {
      mode: 'chat' | 'excel';
      messages: { role: string; content: string }[];
    };

    if (!mode || !messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
    }

    const configItem = MODE_CONFIG[mode];
    if (!configItem) {
      return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400 });
    }

    const apiMessages = [
      { role: 'system', content: configItem.systemPrompt },
      ...messages,
    ];

    const response = await fetch(TINKROW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        model: configItem.model,
        messages: apiMessages,
        temperature: mode === 'excel' ? 0.3 : 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tinkrow API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `Upstream API error: ${response.status}` }), { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
