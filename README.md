# Chapters 📖

**AI-Powered TikTok/Reels Carousel Generator**

Transform your story concepts into viral-ready social media carousels with the power of AI. Chapters combines GPT-4 for storytelling, Flux Pro for stunning visuals, and ElevenLabs for professional voiceovers.

![Chapters Banner](https://via.placeholder.com/1200x400/FAF9F6/E85D04?text=Chapters)

## 🎯 Features

- **🤖 AI-Powered Script Generation**: GPT-4 crafts compelling narratives optimized for social media
- **🎨 Stunning Visuals**: Flux Pro (Fal.ai) generates cinematic 9:16 images
- **🎙️ Professional Voiceovers**: ElevenLabs creates natural-sounding narration
- **✏️ Full Editorial Control**: Edit text, regenerate images, customize voices
- **📱 Real-Time Preview**: See your carousel in a realistic phone mockup
- **🎭 6 Storytelling Vibes**: Nike Greatness, Horror Thread, Educational, Business Case, Luxury Brand, Tech Reveal

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- API keys for:
  - OpenAI (GPT-4)
  - Fal.ai (Flux Pro)
  - ElevenLabs

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chapters
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/chapters"
   OPENAI_API_KEY="sk-..."
   FAL_KEY="..."
   ELEVENLABS_API_KEY="..."
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL with Prisma ORM
- **AI Services**:
  - OpenAI GPT-4 for script generation
  - Fal.ai Flux Pro for image generation
  - ElevenLabs for voice synthesis

### Project Structure

```
chapters/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── projects/             # Project endpoints
│   │   │   ├── generate/         # Generate new project
│   │   │   └── [projectId]/      # Project CRUD
│   │   └── slides/               # Slide endpoints
│   │       └── [slideId]/        # Slide updates & regeneration
│   ├── studio/[projectId]/       # Studio editor page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── home/                     # Home page components
│   │   ├── StoryTrigger.tsx      # Main creation interface
│   │   └── VibePill.tsx          # Vibe selector
│   ├── studio/                   # Studio components
│   │   ├── StudioLayout.tsx      # Main studio container
│   │   ├── SlideRail.tsx         # Left sidebar (slide list)
│   │   ├── PhoneCanvas.tsx       # Center preview
│   │   └── AIControls.tsx        # Right sidebar (AI controls)
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── ai/                       # AI service integrations
│   │   ├── openai.ts             # GPT-4 script generation
│   │   ├── fal.ts                # Flux Pro image generation
│   │   └── elevenlabs.ts         # Voice synthesis
│   ├── db.ts                     # Prisma client
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions
├── prisma/
│   └── schema.prisma             # Database schema
└── package.json
```

## 🎨 Design System

### Brand Colors

- **Canvas**: `#FAF9F6` - Warm, paper-like background
- **Terracotta**: `#E85D04` - Primary action color
- **Anthracite**: `#1F1F1F` - Main text color
- **Stone**: `#E5E5E5` - Borders and dividers

### Typography

- **Serif (Headings)**: Playfair Display - Evokes the "Chapter" metaphor
- **Sans (UI/Body)**: Inter - Clean, modern, readable

## 📊 Database Schema

```prisma
model Project {
  id        String   @id @default(cuid())
  title     String
  concept   String
  vibe      String
  status    String   @default("draft")
  slides    Slide[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Slide {
  id            String   @id @default(cuid())
  projectId     String
  order         Int
  role          String   // HOOK, CONTEXT, DOPAMINE, CLIMAX, CTA
  textContent   String
  imageUrl      String?
  imagePrompt   String
  imageStatus   String   @default("pending")
  voiceoverUrl  String?
  voiceoverText String?
  voiceId       String?
  audioStatus   String   @default("pending")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## 🔌 API Endpoints

### Projects

- `POST /api/projects/generate` - Generate a new project
  - Body: `{ concept: string, vibe: VibeType }`
  - Returns: Project with slides (images/audio generated in background)

- `GET /api/projects/[projectId]` - Get project details
- `PATCH /api/projects/[projectId]` - Update project
- `DELETE /api/projects/[projectId]` - Delete project
- `GET /api/projects/[projectId]/export` - Export project

### Slides

- `PATCH /api/slides/[slideId]` - Update slide text/prompts
- `POST /api/slides/[slideId]/regenerate-image` - Regenerate image
- `POST /api/slides/[slideId]/regenerate-audio` - Regenerate voiceover

## 🎬 User Flow

1. **Story Trigger** (Home Page)
   - User enters a concept (e.g., "The rise and fall of WeWork")
   - Selects a vibe (e.g., "Business Case")
   - Clicks "Write the Chapter"

2. **Generation** (Background)
   - GPT-4 generates 10-15 slide scripts with image prompts
   - Slides are saved to database with "pending" status
   - User is redirected to Studio immediately
   - Images and audio generate in parallel batches

3. **Studio** (Editor)
   - **Left Rail**: Thumbnail list of all slides
   - **Center Canvas**: Phone mockup with live preview
   - **Right Inspector**: Edit prompts, regenerate assets
   - User can edit text directly on canvas
   - Export when satisfied

## 🚧 Roadmap / TODO

- [ ] Custom image upload functionality
- [ ] Video export (MP4 with images + audio stitched)
- [ ] ZIP export for individual assets
- [ ] User authentication (NextAuth.js)
- [ ] Project library/dashboard
- [ ] Slide reordering (drag & drop)
- [ ] Custom voice cloning (ElevenLabs)
- [ ] Template library
- [ ] Social media direct publishing (TikTok/Instagram API)
- [ ] Collaboration features (share projects)
- [ ] Analytics (view counts, engagement)

## 🛠️ Development

### Database Management

```bash
# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Environment Variables

Required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key with GPT-4 access
- `FAL_KEY`: Fal.ai API key
- `ELEVENLABS_API_KEY`: ElevenLabs API key

Optional:

- `NEXTAUTH_SECRET`: For authentication (future)
- `NEXTAUTH_URL`: Base URL for NextAuth

### Cost Estimates (per 10-slide carousel)

- **OpenAI GPT-4**: ~$0.10-0.20 (script generation)
- **Fal.ai Flux Pro**: ~$0.50-1.00 (10 images × $0.05-0.10)
- **ElevenLabs**: ~$0.30-0.60 (10 clips × ~15 words)
- **Total**: ~$0.90-1.80 per carousel

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Reset database
npx prisma db push --force-reset
```

### Image Generation Timeouts

- Fal.ai can take 30-60 seconds per image
- Background generation handles this asynchronously
- Check `/api/projects/[projectId]` for status updates

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙏 Credits

- UI inspired by modern design tools (Figma, Framer)
- "Chapters" metaphor: Stories are made of chapters
- Built with ❤️ using Next.js, Tailwind, and cutting-edge AI

---

**Made with AI** | [Documentation](#) | [Support](#) | [GitHub](#)
