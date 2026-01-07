# Chapters - Complete Setup Guide

This guide will walk you through setting up the Chapters application from scratch.

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **PostgreSQL** installed and running ([Download](https://www.postgresql.org/download/))
- [ ] **Git** installed
- [ ] **OpenAI API account** with GPT-4 access ([Sign up](https://platform.openai.com/))
- [ ] **Fal.ai API account** ([Sign up](https://fal.ai/))
- [ ] **ElevenLabs API account** ([Sign up](https://elevenlabs.io/))

## 🚀 Step-by-Step Setup

### 1. Clone the Project

```bash
# If you received this as a folder, skip this step
# Otherwise, clone from your repository
git clone <your-repo-url>
cd chapters
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React & React DOM
- Tailwind CSS
- Prisma ORM
- Framer Motion
- AI SDK packages

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. **Create a new database:**
   ```bash
   # On macOS/Linux
   psql postgres
   CREATE DATABASE chapters;
   \q
   
   # On Windows (in psql)
   CREATE DATABASE chapters;
   ```

2. **Get your connection string:**
   ```
   postgresql://username:password@localhost:5432/chapters
   ```
   
   Replace:
   - `username`: Your PostgreSQL username (default: `postgres`)
   - `password`: Your PostgreSQL password

#### Option B: Cloud Database (Recommended for Production)

**Supabase (Free tier available):**
1. Go to [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (Direct connection)

**Neon (Free tier available):**
1. Go to [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string

### 4. Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your credentials:**

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/chapters"
   
   # OpenAI API
   OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"
   
   # Fal.ai API
   FAL_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   
   # ElevenLabs API
   ELEVENLABS_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### 5. Get Your API Keys

#### OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. **Important:** You need GPT-4 API access (may require payment setup)

#### Fal.ai API Key

1. Go to [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key

**Note:** Fal.ai requires credits. Add payment method and purchase credits (~$10 is enough for testing).

#### ElevenLabs API Key

1. Go to [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)
2. Sign up or log in
3. Copy your API key
4. **Free tier:** 10,000 characters/month (enough for ~30 slides)

### 6. Initialize the Database

```bash
npx prisma db push
```

This command:
- Creates all database tables
- Sets up the schema
- Prepares Prisma Client

**Expected output:**
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

### 7. Verify Database Setup (Optional)

```bash
npm run db:studio
```

This opens Prisma Studio (database GUI) at `http://localhost:5555`. You should see:
- `Project` table (empty)
- `Slide` table (empty)

### 8. Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### 9. Test the Application

1. **Open your browser:** [http://localhost:3000](http://localhost:3000)

2. **Create your first story:**
   - Enter a concept (e.g., "The story of how Airbnb went from selling cereal to billion-dollar startup")
   - Select a vibe (e.g., "Business Case")
   - Click "Write the Chapter"

3. **Wait for generation:**
   - Script generation: ~10 seconds
   - Image generation: ~30-60 seconds per image
   - Audio generation: ~10-20 seconds per clip
   - **Total time:** 2-5 minutes for a complete 10-slide story

4. **Expected result:**
   - You'll be redirected to the Studio
   - Images and audio will appear progressively
   - You can start editing immediately

## 🔧 Troubleshooting

### Problem: "OpenAI API Error: 429 Rate Limit"

**Solution:** You've hit rate limits. Wait a few minutes or upgrade your OpenAI plan.

### Problem: "Fal.ai API Error: Insufficient Credits"

**Solution:** Add credits to your Fal.ai account at [fal.ai/dashboard/billing](https://fal.ai/dashboard/billing)

### Problem: "Database connection failed"

**Solutions:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env` is correct
3. Try: `npx prisma db push --force-reset` (⚠️ this deletes all data)

### Problem: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Port 3000 already in use"

**Solution:**
```bash
# Find and kill the process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- -p 3001
```

### Problem: Images taking too long to generate

**This is normal!** Flux Pro generates high-quality 720x1280 images which takes 30-60 seconds each. The app processes them in batches of 3 to avoid rate limits.

### Problem: "Prisma Client not found"

**Solution:**
```bash
npx prisma generate
npm run dev
```

## 📊 Testing with Sample Data

Here are some proven concepts to test:

1. **Nike Greatness:**
   - "The comeback story of an athlete who lost everything"

2. **Horror Thread:**
   - "I'm a night shift security guard and something is very wrong"

3. **Educational:**
   - "How quantum computers actually work, explained simply"

4. **Business Case:**
   - "The rise and fall of WeWork: A $47B lesson"

5. **Luxury Brand:**
   - "The art of crafting a $50,000 watch by hand"

6. **Tech Reveal:**
   - "Apple Vision Pro: The device that changes everything"

## 💰 Cost Estimates

### Per 10-Slide Carousel:
- **OpenAI (GPT-4):** ~$0.15
- **Fal.ai (Flux Pro):** ~$0.50-1.00 (10 images)
- **ElevenLabs:** ~$0.30 (10 short audio clips)
- **Total:** ~$1.00-1.50 per complete story

### Free Tier Limits:
- **OpenAI:** No free tier for GPT-4 (requires payment)
- **Fal.ai:** Pay-as-you-go (no free tier, but cheap)
- **ElevenLabs:** 10,000 chars/month free (~30 slides)

## 🚀 Production Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com/)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env`

4. **Set up Production Database:**
   - Use Supabase or Neon (free tiers available)
   - Update `DATABASE_URL` in Vercel

5. **Deploy:**
   ```bash
   # Vercel CLI (optional)
   npm i -g vercel
   vercel
   ```

### Database Migration for Production

```bash
# Connect to production database
DATABASE_URL="your-production-db-url" npx prisma db push
```

## 📚 Next Steps

Once everything is running:

1. **Read the Architecture:** Check `ARCHITECTURE.md` to understand the system
2. **Customize Vibes:** Edit `lib/ai/openai.ts` to add custom storytelling styles
3. **Adjust Prompts:** Modify image generation prompts in the OpenAI script generator
4. **Add Features:** Check the Roadmap in `README.md` for ideas

## 🆘 Getting Help

If you're stuck:

1. **Check logs:** 
   - Browser console (F12)
   - Terminal output
   - Vercel logs (if deployed)

2. **Common issues:**
   - 90% of problems are API key or database connection issues
   - Always check `.env` file first

3. **Debug mode:**
   ```bash
   # Enable detailed Prisma logging
   DATABASE_URL="..." npx prisma studio
   ```

## ✅ Setup Complete!

If you can:
- ✅ Open the app at localhost:3000
- ✅ Generate a story (even if slow)
- ✅ See slides in the Studio
- ✅ Edit text and regenerate images

**You're all set!** 🎉

Start creating viral stories with AI. Remember:
- First generation takes 2-5 minutes (totally normal)
- Images are high quality (720x1280, 9:16 ratio)
- You can edit everything after generation
- Export options are available in the Studio

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.
