# NaoGPT

A minimalist, production-ready dual-mode AI web application built with React, Vite, and TypeScript. NaoGPT features a sleek, modern interface and serves two primary functions: a general-purpose AI chat assistant and a specialized Excel formula generator.

## Features

- Dual-Mode Operation: Seamlessly switch between a general AI assistant (powered by GLM-4.7) and a dedicated Excel formula generator (powered by Qwen-3 Coder).
- Modern User Interface: Built with Tailwind CSS v4, featuring a premium glassmorphic aesthetic, responsive mobile-first design, and a fully functional dark/light mode toggle.
- Secure API Integration: Utilizes Vercel Serverless Functions as a proxy to securely communicate with the DevTinkrow API, ensuring the API key is never exposed to the client.
- Edge Rate Limiting: Integrated Vercel Edge Middleware to limit requests (5 requests per minute per IP), preventing abuse and protecting API quotas.
- Local State Persistence: Conversation history is independently maintained for both modes and securely stored in the browser's localStorage.
- Markdown Support: Full markdown rendering for AI responses, including code blocks with syntax highlighting and one-click copy functionality.

## Tech Stack

- Frontend: React 18, Vite, TypeScript
- Styling: Tailwind CSS v4, Lucide React (Icons)
- Backend & Hosting: Vercel Serverless Functions, Vercel Edge Middleware
- Rendering: React Markdown, Remark GFM

## Getting Started

### Prerequisites

Ensure you have Node.js installed. You will also need the Vercel CLI to run the development server properly, as the application relies on serverless API routes.

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy the example environment file and add your DevTinkrow API key.
```bash
cp .env.example .env
```

Open `.env` and set your key:
```env
TINKROW_API_KEY=sk_your_api_key_here
```

### Development

To run the application locally with full support for the Vercel serverless functions, use the Vercel CLI:

```bash
npx vercel dev
```

This will start a local development server (typically on `http://localhost:3000`) that serves both the React frontend and the backend API routes. Note that running `npm run dev` will only start the frontend, which will result in API connection errors.

## Deployment

This application is configured for seamless deployment on Vercel. 

1. Push your code to your GitHub repository.
2. Import the project into your Vercel dashboard.
3. Add the `TINKROW_API_KEY` to your Vercel project's Environment Variables.
4. Deploy.

## Architecture Notes

- `/api/chat.ts`: Serverless function that proxies requests, injects the system prompt, and assigns the correct model based on the selected mode.
- `/middleware.ts`: Edge middleware that intercepts API requests to enforce rate limits using an in-memory map strategy.
- `/src/hooks/useConversations.ts`: Manages the state and persistence of chat histories.

## License

MIT License
