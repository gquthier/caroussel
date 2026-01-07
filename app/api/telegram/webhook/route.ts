import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  TelegramUpdate, 
  getVoiceFile, 
  sendMessage 
} from '@/lib/telegram/bot';
import { transcribeAudio } from '@/lib/ai/openai';
import { generateStoryScript } from '@/lib/ai/openai';
import { generateImage } from '@/lib/ai/fal';
import { generateVoiceover } from '@/lib/ai/elevenlabs';
import { createQueueHistory, trackStage } from '@/lib/queue/history';

/**
 * Webhook Telegram - Reçoit les messages vocaux et texte
 * Flow: Message → Transcription → Génération → Envoi résultat
 */
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    
    console.log('Telegram update received:', JSON.stringify(update, null, 2));

    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id;

    // Gestion des messages vocaux
    if (message.voice) {
      console.log('Voice message received');
      
      await sendMessage(chatId, '🎙 Transcription en cours...');

      // 1. Télécharger le fichier audio
      const audioBuffer = await getVoiceFile(message.voice.file_id);

      // 2. Transcrire avec Whisper
      const transcription = await transcribeAudio(audioBuffer);
      
      await sendMessage(chatId, `📝 Transcription: ${transcription}`);
      await sendMessage(chatId, '🎬 Génération du carousel en cours... (cela peut prendre 2-5 minutes)');

      // 3. Générer le carousel en arrière-plan
      processCarouselGeneration(chatId, transcription, message.message_id).catch(console.error);

      return NextResponse.json({ ok: true });
    }

    // Gestion des messages texte
    if (message.text) {
      console.log('Text message received:', message.text);
      
      await sendMessage(chatId, '🎬 Génération du carousel en cours... (cela peut prendre 2-5 minutes)');

      // Générer le carousel en arrière-plan
      processCarouselGeneration(chatId, message.text, message.message_id).catch(console.error);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Traitement en arrière-plan de la génération du carousel
 * Flow exact n8n: Transcription → Scenario → Rework → (Script + ImagePrompts) en parallèle → Audio + Images
 */
async function processCarouselGeneration(chatId: number, transcription: string, messageId?: number) {
  const { telegramLogger } = await import('@/lib/logging/telegram-logger');
  const startTime = Date.now();
  
  try {
    // Configurer le logger pour ce chat
    telegramLogger.setContext({ chatId });
    
    await telegramLogger.info('🎬 Démarrage de la génération...');
    await telegramLogger.info(`📝 Utilisation de la transcription: "${transcription.substring(0, 100)}..."`);
    
    // Flow n8n: Transcription → Scenario → Rework → (Script + ImagePrompts) en parallèle
    const { title, slides: scriptSlides, metadata } = await generateStoryScript(transcription);

    // Trouver ou créer l'utilisateur basé sur le Telegram ID
    let user = await prisma.user.findUnique({
      where: { telegramId: chatId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: chatId,
          telegramUsername: `telegram_${chatId}`,
        }
      });
    }

    // Étape 2: Créer le projet dans la DB avec infos Telegram et metadata
    const project = await prisma.project.create({
      data: {
        title,
        concept: transcription,
        vibe: 'nike_greatness', // Style "Greatness" du n8n
        status: 'generating',
        telegramChatId: chatId,
        telegramMessageId: messageId,
        userId: user.id,
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

    await telegramLogger.success(`Projet créé: "${title}"`);
    
    // Étape 3: Générer l'audio ElevenLabs depuis Supabase (script complet normalisé)
    await telegramLogger.stage('audio', 'Génération de l\'audio ElevenLabs...');
    const normalizedScript = metadata?.normalizedScript || scriptSlides.map(s => s.textContent).join(' ');
    
    let audioUrl: string | null = null;
    try {
      audioUrl = await generateVoiceover(normalizedScript);
      await telegramLogger.success('Audio ElevenLabs généré');
      
      // Envoyer l'audio sur Telegram immédiatement
      const { sendAudio } = await import('@/lib/telegram/bot');
      await sendAudio(chatId, audioUrl, `🎙️ Audio du carousel "${title}"`);
      await telegramLogger.info('Audio envoyé sur Telegram');
    } catch (error) {
      console.error('Error generating audio:', error);
      await telegramLogger.error('Erreur lors de la génération audio', error instanceof Error ? error : undefined);
    }
    
    // Étape 4: Générer les images (10-20 carousels selon le nombre de prompts)
    await telegramLogger.stage('images', `Génération de ${project.slides.length} images (batch de 3)...`);
    const imageUrls: string[] = [];
    
    for (let i = 0; i < project.slides.length; i += 3) {
      const batch = project.slides.slice(i, i + 3);
      
      await Promise.all(
        batch.map(async (slide) => {
          try {
            // Générer l'image
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

            imageUrls.push(imageUrl);
          } catch (error) {
            console.error(`Error generating image for slide ${slide.id}:`, error);
            await prisma.slide.update({
              where: { id: slide.id },
              data: { 
                imageStatus: 'failed',
              },
            });
          }
        })
      );

      await telegramLogger.progress(`${i + batch.length}/${project.slides.length} images générées`);
    }
    
    // Mettre à jour l'audio dans la DB si généré
    if (audioUrl) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          slides: {
            updateMany: {
              where: {},
              data: {
                voiceoverUrl: audioUrl,
                audioStatus: 'completed',
              },
            },
          },
        },
      });
    }

    // Étape 4: Envoyer le résultat sur Telegram
    const duration = Date.now() - startTime;
    
    await telegramLogger.summary({
      title,
      totalSlides: project.slides.length,
      completedImages: imageUrls.length,
      completedAudio: project.slides.filter(s => s.audioStatus === 'completed').length,
      duration,
    });
    
    await telegramLogger.success(`Carousel terminé ! 🎉\n🔗 ${process.env.NEXTAUTH_URL}/studio/${project.id}`);

    // Envoyer les images (max 10 par groupe) - SANS CAPTIONS
    const { sendMediaGroup } = await import('@/lib/telegram/bot');
    
    for (let i = 0; i < imageUrls.length; i += 10) {
      const group = imageUrls.slice(i, i + 10);
      await sendMediaGroup(chatId, group); // Pas de caption
    }

    // Mettre à jour le statut du projet
    await prisma.project.update({
      where: { id: project.id },
      data: { status: 'completed' },
    });

  } catch (error) {
    console.error('Error in carousel generation:', error);
    await telegramLogger.error('Erreur lors de la génération', error instanceof Error ? error : undefined);
  } finally {
    telegramLogger.clearContext();
  }
}
