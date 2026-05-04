import type { VercelRequest, VercelResponse } from '@vercel/node';

const TINKROW_CHAT_URL = 'https://base.tinkrow.space/api/chat/v1/chat/completions';
const TINKROW_IMAGE_URL = 'https://api.tinkrow.space/api/v1/images/generation';
// Mengambil API Key yang disetting di Vercel atau file .env (lokal)
// Pastikan nama variabel env di Vercel adalah TINKROW_API_KEY
const API_KEY = process.env.TINKROW_API_KEY || 'sk_eur5lwqgn_eur5lwqgn';

export const maxDuration = 60;

const MODE_CONFIG = {
  excel: {
    model: 'vertex_ai/qwen/qwen3-coder-480b-a35b-instruct-maas',
    systemPrompt:
      'Kamu adalah NaoGPT, asisten ahli pembuat rumus Excel dan Google Sheets. Jika pengguna meminta rumus, berikan rumus yang paling tepat dan efisien dalam format markdown code block (```excel), diikuti dengan penjelasan singkat yang mudah dipahami (maksimal 2-3 kalimat). Jika pengguna hanya menyapa, mengobrol, bertanya, atau mengonfirmasi (bukan meminta rumus baru), jawablah dengan natural, responsif, dan ramah seperti manusia tanpa memaksakan memberikan rumus. Hindari memberikan rumus jika tidak relevan dengan konteks percakapan saat itu.',
  },
  chat: {
    model: 'vertex_ai/openai/gpt-oss-20b-maas', // Menggunakan GPT-OSS 20B sesuai permintaan
    systemPrompt:
      'Nama kamu adalah NaoGPT, asisten AI cerdas yang dibuat oleh Rashya Adithiya. Jawab dengan ramah, informatif, dan sopan. Perkenalkan dirimu (nama dan pembuat) HANYA saat pengguna menyapa atau bertanya siapa kamu. Di luar itu, langsung jawab pertanyaan tanpa perlu menyebut nama atau pembuatmu lagi.',
  },
  image: {
    model: 'vertex_ai/gemini-2.5-flash-image', // Model khusus untuk endpoint image generation
    systemPrompt: '', // Endpoint image generation tidak butuh system prompt
  },
} as const;

interface RateLimitData {
  count: number;
  resetAt: number;
}
const imageRateLimitMap = new Map<string, RateLimitData>();
const IMAGE_DAILY_LIMIT = 4;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured in Vercel' });
  }

  const { mode, messages } = req.body as {
    mode: 'chat' | 'excel' | 'image';
    messages: { role: string; content: string }[];
  };

  if (!mode || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const config = MODE_CONFIG[mode];
  if (!config) {
    return res.status(400).json({ error: 'Invalid mode' });
  }

  // Rate Limiting Khusus Image Mode (4 per day)
  if (mode === 'image') {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : (req.socket?.remoteAddress || 'unknown');
    
    const now = Date.now();
    const userLimit = imageRateLimitMap.get(ip);

    if (userLimit && now > userLimit.resetAt) {
      // Reset kuota setelah 24 jam
      imageRateLimitMap.set(ip, { count: 1, resetAt: now + ONE_DAY_MS });
    } else if (userLimit) {
      if (userLimit.count >= IMAGE_DAILY_LIMIT) {
        return res.status(429).json({ 
          error: `Limit pembuatan gambar harian tercapai (maksimal ${IMAGE_DAILY_LIMIT}/hari). Silakan coba lagi besok untuk menghemat kuota.` 
        });
      }
      userLimit.count += 1;
    } else {
      imageRateLimitMap.set(ip, { count: 1, resetAt: now + ONE_DAY_MS });
    }
  }

  try {
    if (mode === 'image') {
      // Ambil prompt dari pesan terakhir pengguna
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || 'Gambar random';
      
      const response = await fetch(TINKROW_IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          prompt: lastUserMessage,
          model: config.model,
          n: 1,
          size: "1024x1024",
          quality: "standard"
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Tinkrow Image API error:', response.status, errorBody);
        return res.status(response.status).json({
          error: `Upstream Image API error: ${response.status}`,
        });
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;

      if (!imageUrl) {
        throw new Error('Image URL not found in response');
      }

      // Format response agar sesuai dengan format chat yang diharapkan frontend
      return res.status(200).json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: `Berikut adalah gambar yang kamu minta:\n\n![Generated Image](${imageUrl})`
            }
          }
        ]
      });
    }

    // Handle 'chat' dan 'excel' modes
    const apiMessages = [
      { role: 'system', content: config.systemPrompt },
      ...messages,
    ];

    const response = await fetch(TINKROW_CHAT_URL, {
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
      console.error('Tinkrow Chat API error:', response.status, errorBody);
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
