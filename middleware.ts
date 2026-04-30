import { next } from '@vercel/edge';

const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

const ipRequests = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequests.entries()) {
    if (now > data.resetAt) {
      ipRequests.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export default function middleware(request: Request) {
  const url = new URL(request.url);
  // Only rate-limit API routes
  if (!url.pathname.startsWith('/api/chat')) {
    return next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const entry = ipRequests.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  entry.count++;
  return next();
}

export const config = {
  matcher: '/api/:path*',
};
