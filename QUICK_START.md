# 🚀 Quick Start Guide

## ✅ Your Perplexity AI Clone is Ready!

The development server is currently running at: **http://localhost:3000**

---

## 📝 How to Run the Application

### Method 1: PowerShell Scripts (Recommended)

#### Start Development Server
```powershell
.\start-dev.ps1
```

#### Build for Production
```powershell
.\build.ps1
```

#### Start Production Server
```powershell
.\start-prod.ps1
```

### Method 2: Direct Commands

#### Development
```powershell
node ./node_modules/next/dist/bin/next dev
```

#### Build
```powershell
node ./node_modules/next/dist/bin/next build
```

#### Production
```powershell
node ./node_modules/next/dist/bin/next start
```

---

## 🎯 Testing the Application

### 1. Visit the Landing Page
- Open http://localhost:3000
- You'll see a beautiful hero section with a search bar
- Try the example questions or type your own

### 2. Test the Chat Interface
- Enter a question like "What is quantum computing?"
- Watch the streaming magic:
  - Plan steps appear in real-time
  - Sources are being crawled
  - Answer streams word by word
  - Citations are linked

### 3. Multi-turn Conversations
- Ask follow-up questions
- The context is maintained
- Each message shows streaming states
- Click "New Chat" to start fresh

---

## 📁 Project Overview

### Pages
- **`/`** - Landing page with search
- **`/chat`** - Chat interface with streaming
- **`/chat?question=<text>`** - Chat with initial question

### Key Components

#### Chat Components (`components/chat/`)
- **`message.tsx`** - Renders user and assistant messages
- **`streaming-answer.tsx`** - Wrapper for streaming states
- **`plan.tsx`** - Displays plan steps with icons
- **`sources.tsx`** - Shows crawled sources with status
- **`answer.tsx`** - Markdown answer with citations

#### UI Components (`components/ui/`)
- All from shadcn/ui: Button, Input, ScrollArea, Skeleton, etc.

#### Utilities (`lib/`)
- **`stream.ts`** - Streaming parser and API functions
- **`utils.ts`** - Helper functions (cn for classnames)

#### Types (`types/`)
- **`chat.ts`** - TypeScript interfaces and types

---

## 🎨 Features Showcase

### Landing Page Features
✅ Gradient background with blur effects  
✅ Pixel-perfect search bar  
✅ Smooth animations  
✅ Example questions  
✅ Responsive design  

### Chat Interface Features
✅ Real-time streaming responses  
✅ Step-by-step plan visualization  
✅ Source status indicators  
✅ Markdown formatting  
✅ Auto-scroll behavior  
✅ Loading states  
✅ Error handling  
✅ Multi-turn conversations  

### Streaming Features
✅ Plan updates in real-time  
✅ Source crawling with status  
✅ Word-by-word answer streaming  
✅ Citation support  
✅ Smooth animations  

---

## 🔧 Customization Tips

### Change Theme Colors
Edit `app/globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
```

### Modify Animations
Edit `tailwind.config.ts`:
```typescript
keyframes: {
  "fade-in": {
    from: { opacity: "0", transform: "translateY(10px)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },
  // Add more...
}
```

### Update API Endpoint
Edit `lib/stream.ts`:
```typescript
export async function makeStreamingRequest(question: string) {
  const response = await fetch("YOUR_API_ENDPOINT", {
    // ...
  });
  return response;
}
```

---

## 📊 Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **TailwindCSS** | Utility-first styling |
| **shadcn/ui** | Beautiful UI components |
| **TanStack Query** | Data fetching & streaming state |
| **react-markdown** | Markdown rendering |
| **Lucide React** | Icon library |

---

## 🐛 Troubleshooting

### Server Won't Start with npm run dev
**Issue**: The `&` in the folder name causes npm script issues on Windows.

**Solution**: Use the PowerShell scripts or direct node commands provided above.

### Port Already in Use
**Solution**: 
```powershell
# Kill the process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### TypeScript Errors
**Solution**: 
```powershell
# Restart VS Code TypeScript server
# Press Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### Build Errors
**Solution**:
```powershell
# Clear .next directory and rebuild
Remove-Item -Recurse -Force .next
node ./node_modules/next/dist/bin/next build
```

---

## 📈 Performance

- ✅ Optimized streaming parser
- ✅ Efficient state updates
- ✅ Auto-scroll optimization
- ✅ Lazy loading with React Suspense
- ✅ Production-ready build

---

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

### Netlify
1. Build command: `node ./node_modules/next/dist/bin/next build`
2. Publish directory: `.next`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)

---

## ✨ What's Next?

### Suggested Improvements
1. **Add Chat History** - Store conversations in localStorage
2. **Dark Mode** - Add theme toggle
3. **Copy to Clipboard** - Copy answers easily
4. **Share Conversations** - Generate shareable links
5. **Voice Input** - Web Speech API integration
6. **Export Chat** - Export as PDF/Markdown
7. **User Authentication** - Add auth with NextAuth.js
8. **Rate Limiting** - Prevent API abuse

---

## 🎉 Congratulations!

You now have a fully functional, production-ready Perplexity AI clone!

**Built with:**
- ❤️ Passion
- ⚡ Next.js 14
- 🎨 TailwindCSS
- 🧩 shadcn/ui
- 📡 Real streaming API

**Happy coding!** 🚀
