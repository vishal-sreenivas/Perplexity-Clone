# Perplexity AI Clone

A complete, production-grade Perplexity-style chat interface built with Next.js 14, TailwindCSS, shadcn/ui, and TanStack Query.

## Features

- 🚀 **Next.js 14** with App Router
- 💅 **TailwindCSS** for styling
- 🎨 **shadcn/ui** components
- 📡 **Real-time streaming** with TanStack Query
- 🔄 **Multi-turn conversations**
- 📱 **Fully responsive** design
- ✨ **Smooth animations** and transitions
- 🎯 **Production-ready** code

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (get one at https://platform.openai.com/api-keys)

### Installation

```bash
npm install
```

### Configuration

1. Copy the environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

See `API_KEY_SETUP.md` for detailed instructions on getting your API key.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── chat/
│   │   └── page.tsx        # Chat interface
│   └── globals.css         # Global styles
├── components/
│   ├── chat/
│   │   ├── message.tsx            # Message component
│   │   ├── streaming-answer.tsx   # Streaming answer wrapper
│   │   ├── plan.tsx               # Plan steps display
│   │   ├── sources.tsx            # Sources display
│   │   └── answer.tsx             # Answer with markdown
│   ├── ui/                 # shadcn/ui components
│   └── providers.tsx       # TanStack Query provider
├── lib/
│   ├── stream.ts          # Streaming utilities
│   └── utils.ts           # Helper functions
└── types/
    └── chat.ts            # TypeScript types
```

## Features in Detail

### Landing Page
- Clean hero section with gradient background
- Pixel-perfect search bar
- Example questions
- Smooth navigation to chat

### Chat Interface
- Real-time streaming responses
- Step-by-step plan display
- Source citations with status indicators
- Markdown-formatted answers
- Multi-turn conversations
- Auto-scroll to latest message
- Loading states and animations

### Streaming Implementation
- Full SSE (Server-Sent Events) support
- Chunked response parsing
- Real-time UI updates
- Error handling
- State management with TanStack Query

## API

The application now uses **real AI** powered by OpenAI GPT-4o-mini to answer your questions.

**Backend API Route:** `/api/chat` (Next.js API route)  
**AI Model:** OpenAI GPT-4o-mini  
**Streaming:** Real-time Server-Sent Events (SSE)

The local API route (`app/api/chat/route.ts`) handles:
- Question processing
- OpenAI API integration with streaming
- Response formatting in Perplexity-style SSE format
- Plan/goal generation
- Source attribution
- Incremental answer delivery

**Cost:** Very affordable at ~$0.15 per 1M input tokens and ~$0.60 per 1M output tokens.

> **Important:** You need an OpenAI API key to use the app. See `API_KEY_SETUP.md` for setup instructions.

## Tech Stack

- **Framework**: Next.js 14.1
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React
- **Markdown**: react-markdown

## License

MIT
