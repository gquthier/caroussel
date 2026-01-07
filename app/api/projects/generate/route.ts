import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateStoryScript } from '@/lib/ai/openai';
import { generateImage } from '@/lib/ai/fal';
import { generateVoiceover } from '@/lib/ai/elevenlabs';

export async function POST(request: NextRequest) {
  const { telegramLogger } = await import('@/lib/logging/telegram-logger');
  
  try {
    const body = await request.json();
    const { concept } = body as { concept: string };

    if (!concept) {
      return NextResponse.json(
        { error: 'Concept is required' },
        { status: 400 }
      );
    }

    // Configurer le logger (sans chatId spécifique = logs vers groupe master uniquement)
    telegramLogger.setContext({ projectId: 'web-generation' });

    // Step 1: Generate the story script using OpenAI (with n8n prompts)
    await telegramLogger.info(`🌐 Nouvelle génération depuis le site web`);
    await telegramLogger.info(`💡 Concept: ${concept}`);
    
    const { title, slides: scriptSlides, metadata } = await generateStoryScript(concept);

    // Step 2: Create project in database with metadata
    const project = await prisma.project.create({
      data: {
        title,
        concept,
        vibe: 'nike_greatness', // Always use Greatness style from n8n
        status: 'generating',
        initialScenario: metadata?.initialScenario,
        reworkedScenario: metadata?.reworkedScenario,
        rawScript: metadata?.rawScript,
        slides: {
          create: scriptSlides.map((slide, index) => ({
            order: index,
            role: slide.role,
            textContent: slide.textContent,
            imagePrompt: slide.imagePrompt,
            voiceoverText: slide.textContent,
            imageStatus: 'pending',
            audioStatus: 'pending',
          })),
        },
      },
      include: {
        slides: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Step 3: Start background generation of images and audio
    // We return immediately and process in background
    // Si l'utilisateur a un Telegram, on le notifie
    generateAssetsInBackground(project.id, project.userId || undefined).catch(console.error);

    await telegramLogger.success(`Projet créé: ${project.id}`);
    await telegramLogger.info(`🔗 Studio: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/studio/${project.id}`);

    return NextResponse.json({
      projectId: project.id,
      title: project.title,
      slides: project.slides,
    });
  } catch (error) {
    console.error('Error generating project:', error);
    const { telegramLogger } = await import('@/lib/logging/telegram-logger');
    await telegramLogger.error('Erreur lors de la génération', error instanceof Error ? error : undefined);
    
    return NextResponse.json(
      { error: 'Failed to generate project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    const { telegramLogger } = await import('@/lib/logging/telegram-logger');
    telegramLogger.clearContext();
  }
}

// Background processing function
async function generateAssetsInBackground(projectId: string, userId?: string) {
  const { notifyProjectProgress, notifyProjectCompleted } = await import('@/lib/notifications/telegram');
  try {
    if (userId) {
      await notifyProjectProgress(projectId, 'images', 'Génération des images en cours...');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { slides: { orderBy: { order: 'asc' } } },
    });

    if (!project) return;

    // Generate images and audio for all slides in parallel (with some rate limiting)
    const batchSize = 3; // Process 3 slides at a time
    const slides = project.slides;

    for (let i = 0; i < slides.length; i += batchSize) {
      const batch = slides.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (slide) => {
          try {
            // Generate image
            await prisma.slide.update({
              where: { id: slide.id },
              data: { imageStatus: 'generating' },
            });

            const imageUrl = await generateImage(slide.imagePrompt);
            
            await prisma.slide.update({
              where: { id: slide.id },
              data: { 
                imageUrl,
                imageStatus: 'completed',
              },
            });

            // Generate voiceover
            await prisma.slide.update({
              where: { id: slide.id },
              data: { audioStatus: 'generating' },
            });

            const voiceoverUrl = await generateVoiceover(slide.voiceoverText || slide.textContent);
            
            await prisma.slide.update({
              where: { id: slide.id },
              data: { 
                voiceoverUrl,
                audioStatus: 'completed',
              },
            });
          } catch (error) {
            console.error(`Error generating assets for slide ${slide.id}:`, error);
            await prisma.slide.update({
              where: { id: slide.id },
              data: { 
                imageStatus: 'failed',
                audioStatus: 'failed',
              },
            });
          }
        })
      );
    }

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'completed' },
    });

    console.log(`Project ${projectId} generation completed`);
    
    // Notifier l'utilisateur sur Telegram si connecté
    if (userId) {
      await notifyProjectCompleted(projectId);
    }
  } catch (error) {
    console.error('Error in background generation:', error);
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'failed' },
    });
  }
}
