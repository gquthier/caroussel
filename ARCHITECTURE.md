# Chapters - Technical Architecture

## System Overview

Chapters is a full-stack SaaS application that transforms text concepts into ready-to-publish TikTok/Instagram Reels carousels. The system orchestrates multiple AI services (OpenAI, Fal.ai, ElevenLabs) to generate scripts, images, and voiceovers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Home Page   │  │    Studio    │  │   Preview    │      │
│  │ (Creation)   │─▶│   (Editor)   │─▶│  (Export)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    NEXT.JS APP (Server)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Routes (Serverless)                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │ Projects │  │  Slides  │  │  Asset Mgmt      │  │   │
│  │  └────┬─────┘  └────┬─────┘  └─────────┬────────┘  │   │
│  └───────┼─────────────┼─────────────────┼────────────┘   │
│          │             │                  │                 │
│  ┌───────▼─────────────▼─────────────────▼────────────┐   │
│  │          Business Logic Layer                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │ Script Gen   │  │  Image Gen   │  │ Audio Gen│ │   │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │   │
│  └─────────┼─────────────────┼────────────────┼───────┘   │
│            │                 │                 │            │
└────────────┼─────────────────┼─────────────────┼───────────┘
             │                 │                 │
    ┌────────▼────────┐ ┌─────▼──────┐ ┌───────▼────────┐
    │   OpenAI API    │ │  Fal.ai    │ │  ElevenLabs    │
    │    (GPT-4)      │ │ (Flux Pro) │ │   (Voices)     │
    └─────────────────┘ └────────────┘ └────────────────┘
             │
    ┌────────▼────────┐
    │   PostgreSQL    │
    │    (Prisma)     │
    └─────────────────┘
```

## Data Flow

### 1. Story Generation Flow

```
User Input → API Route → OpenAI → Database → Background Worker
   ↓                                              ↓
Concept                                    Parallel Generation
+ Vibe                                     ├─ Image 1 (Fal.ai)
   ↓                                       ├─ Image 2 (Fal.ai)
Generate                                   ├─ Audio 1 (ElevenLabs)
   ↓                                       └─ Audio 2 (ElevenLabs)
10-15 Slides                                      ↓
   ↓                                        Database Update
Redirect to                                       ↓
Studio                                      Polling / WebSocket
   ↓                                              ↓
Real-time                                   Live Updates
Preview                                      in Studio UI
```

### 2. Slide Edit Flow

```
User Action → API Route → Database → State Update → UI Refresh
   ↓
Text Edit
   ↓
PATCH /api/slides/[id]
   ↓
Update DB
   ↓
Return Updated Slide
   ↓
Update React State
   ↓
Re-render Canvas
```

### 3. Asset Regeneration Flow

```
User Click → API Route → AI Service → Database → UI Update
   ↓
Regenerate
   ↓
Update Status: "generating"
   ↓
Call AI API
   ↓
Get New Asset URL
   ↓
Update Status: "completed"
   ↓
Return to Client
   ↓
Display New Asset
```

## Component Hierarchy

```
App
├── Layout (Root)
│   ├── fonts (Inter, Playfair Display)
│   └── global styles
│
├── Home Page (/)
│   └── StoryTrigger
│       ├── Concept Input (Textarea)
│       ├── Vibe Selector (6 VibePills)
│       └── Generate Button
│           └── Loading State (Progress Bar)
│
└── Studio Page (/studio/[projectId])
    └── StudioLayout
        ├── Header
        │   ├── Project Title
        │   └── Export/Publish Buttons
        │
        ├── SlideRail (Left)
        │   └── Slide Cards (List)
        │       ├── Thumbnail
        │       ├── Order Number
        │       └── Role Badge
        │
        ├── PhoneCanvas (Center)
        │   ├── Phone Mockup
        │   │   ├── Image Background
        │   │   ├── Text Overlay (Editable)
        │   │   └── Audio Player
        │   └── Framer Motion Transitions
        │
        └── AIControls (Right)
            └── Tabs (Image / Audio)
                ├── Image Tab
                │   ├── Status Badge
                │   ├── Prompt Editor (Textarea)
                │   └── Regenerate Button
                └── Audio Tab
                    ├── Status Badge
                    ├── Script Editor (Textarea)
                    ├── Voice Selector
                    └── Regenerate Button
```

## State Management

### Client State (React)

- **Local Component State**: UI interactions, form inputs
- **Props Drilling**: Parent → Child data flow
- **URL State**: `projectId` from route params

### Server State (Database)

- **Projects Table**: Metadata, status
- **Slides Table**: Content, assets, prompts

### Synchronization

- **Polling**: Client polls `/api/projects/[id]` every 5s during generation
- **Optimistic Updates**: UI updates immediately, API confirms async
- **Error Handling**: Rollback on failure

## API Design

### RESTful Conventions

```
GET    /api/projects/[id]              # Read project
PATCH  /api/projects/[id]              # Update project
DELETE /api/projects/[id]              # Delete project
POST   /api/projects/generate          # Create + generate

GET    /api/slides/[id]                # Read slide
PATCH  /api/slides/[id]                # Update slide
POST   /api/slides/[id]/regenerate-image   # Regenerate image
POST   /api/slides/[id]/regenerate-audio   # Regenerate audio
```

### Request/Response Format

**Generate Project Request:**
```json
{
  "concept": "The untold story of...",
  "vibe": "nike_greatness"
}
```

**Generate Project Response:**
```json
{
  "projectId": "clx123abc",
  "title": "Untold Story",
  "slides": [
    {
      "id": "slide1",
      "order": 0,
      "role": "HOOK",
      "textContent": "This changes everything...",
      "imagePrompt": "Cinematic wide shot...",
      "imageStatus": "pending",
      "audioStatus": "pending"
    }
  ]
}
```

## AI Service Integration

### OpenAI (Script Generation)

**Model**: GPT-4 Turbo
**Input**: Concept + Vibe system prompt
**Output**: JSON with title + slides array
**Cost**: ~$0.10-0.20 per generation
**Latency**: 5-15 seconds

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: VIBE_PROMPTS[vibe] },
    { role: 'user', content: concept }
  ],
  response_format: { type: 'json_object' }
});
```

### Fal.ai (Image Generation)

**Model**: Flux Pro
**Input**: Image prompt + size specs
**Output**: Image URL
**Cost**: ~$0.05-0.10 per image
**Latency**: 30-60 seconds

```typescript
const response = await axios.post(FAL_API_URL, {
  prompt: enhancedPrompt,
  image_size: { width: 720, height: 1280 },
  num_inference_steps: 28
});
```

### ElevenLabs (Voice Synthesis)

**Model**: Multilingual v2
**Input**: Text + voice ID
**Output**: Audio data (base64)
**Cost**: ~$0.03 per clip
**Latency**: 10-20 seconds

```typescript
const response = await axios.post(
  `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
  { text, voice_settings },
  { responseType: 'arraybuffer' }
);
```

## Database Schema Details

### Project Status States

- `draft`: Initial state, no generation started
- `generating`: Assets being created in background
- `completed`: All assets ready
- `failed`: Generation error occurred

### Slide Asset Status

- `pending`: Not started
- `generating`: AI service processing
- `completed`: Asset ready, URL stored
- `failed`: Generation error

### Relationships

```
Project (1) ──┬─▶ Slides (many)
              │
              └─▶ Cascading delete
                  (delete project → delete all slides)
```

## Performance Optimizations

### Image Optimization

- Next.js `Image` component for automatic optimization
- Remote image domains whitelisted in `next.config.js`
- Lazy loading for slide thumbnails

### API Batching

- Generate assets in batches of 3 (rate limiting)
- Parallel processing within batches
- Sequential batch execution

### Caching

- Prisma client singleton (development)
- Static assets cached (fonts, images)
- API responses not cached (real-time updates needed)

## Security Considerations

### API Keys

- Stored in environment variables
- Never exposed to client
- Server-side only execution

### Input Validation

- Zod schemas for request validation (TODO)
- Max text lengths enforced
- SQL injection protected (Prisma ORM)

### Rate Limiting

- TODO: Implement rate limiting per IP
- TODO: User authentication + quotas

## Deployment

### Recommended Stack

- **Hosting**: Vercel (optimized for Next.js)
- **Database**: Supabase PostgreSQL or Neon
- **Environment**: Serverless functions (API routes)
- **CDN**: Automatic (Vercel Edge Network)

### Environment Variables

```bash
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
FAL_KEY="..."
ELEVENLABS_API_KEY="..."
```

### Build Command

```bash
npm run build
```

### Database Migration

```bash
npx prisma db push
```

## Monitoring & Observability

### Logging

- `console.log` in API routes (Vercel captures logs)
- Error tracking: TODO (Sentry integration)

### Metrics

- API latency: Vercel analytics
- AI service costs: Track in separate dashboard
- Database queries: Prisma query logging

## Scalability Considerations

### Current Limitations

- Synchronous background processing (single server)
- No job queue (in-memory only)
- Polling for updates (not WebSockets)

### Future Improvements

- **Job Queue**: BullMQ with Redis
- **WebSockets**: Real-time updates via Pusher/Ably
- **CDN**: Store generated assets in S3/Cloudflare R2
- **Caching**: Redis for frequently accessed projects
- **Horizontal Scaling**: Multiple serverless instances (automatic with Vercel)

## Testing Strategy

### Unit Tests (TODO)

- Utility functions (`lib/utils.ts`)
- AI service wrappers (mock responses)

### Integration Tests (TODO)

- API route handlers
- Database operations (test DB)

### E2E Tests (TODO)

- User flow: Create → Edit → Export
- Playwright or Cypress

## Development Workflow

1. **Local Setup**: PostgreSQL + environment variables
2. **Schema Changes**: Edit `prisma/schema.prisma` → `npx prisma db push`
3. **Component Development**: Hot reload with `npm run dev`
4. **API Testing**: Postman or Thunder Client
5. **Database Inspection**: `npm run db:studio`

## Future Architecture Enhancements

### Phase 2: Collaboration

- Multi-user editing (real-time with Yjs)
- Project sharing & permissions
- Comment threads on slides

### Phase 3: Advanced Features

- Video rendering (FFmpeg on serverless)
- Custom voice cloning (ElevenLabs API)
- Template marketplace
- Analytics dashboard

### Phase 4: Enterprise

- Team workspaces
- SSO authentication
- Advanced permissions
- Audit logs
- SLA guarantees
