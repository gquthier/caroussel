/**
 * Service de notifications Telegram
 * Permet d'envoyer des notifications depuis Desktop vers Telegram
 */

import { sendMessage } from '@/lib/telegram/bot';
import { prisma } from '@/lib/db';

/**
 * Envoyer une notification à l'utilisateur sur Telegram
 */
export async function notifyUserOnTelegram(
  userId: string,
  message: string
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.telegramId) {
      console.log('User has no Telegram ID, skipping notification');
      return;
    }

    await sendMessage(user.telegramId, message);
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

/**
 * Notifier l'utilisateur de la progression d'un projet
 */
export async function notifyProjectProgress(
  projectId: string,
  stage: string,
  message: string
): Promise<void> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project?.user?.telegramId) {
      return;
    }

    const emoji = getStageEmoji(stage);
    await sendMessage(
      project.user.telegramId,
      `${emoji} ${message}\n\n📱 Projet: ${project.title}`
    );
  } catch (error) {
    console.error('Error notifying project progress:', error);
  }
}

/**
 * Notifier l'utilisateur quand un projet est terminé
 */
export async function notifyProjectCompleted(projectId: string): Promise<void> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        slides: true,
      },
    });

    if (!project?.user?.telegramId) {
      return;
    }

    const completedImages = project.slides.filter(s => s.imageStatus === 'completed').length;
    const completedAudio = project.slides.filter(s => s.audioStatus === 'completed').length;

    await sendMessage(
      project.user.telegramId,
      `🎉 Votre carousel est prêt !\n\n` +
      `📱 Titre: ${project.title}\n` +
      `🖼 ${completedImages}/${project.slides.length} images\n` +
      `🎵 ${completedAudio}/${project.slides.length} audios\n\n` +
      `🔗 Ouvrir: ${process.env.NEXTAUTH_URL}/studio/${project.id}`
    );
  } catch (error) {
    console.error('Error notifying project completion:', error);
  }
}

function getStageEmoji(stage: string): string {
  const emojis: Record<string, string> = {
    scenario: '📝',
    rework: '✨',
    image_prompts: '🎨',
    script: '📜',
    normalization: '🔧',
    images: '🖼️',
    audio: '🎙️',
    completed: '✅',
  };
  return emojis[stage] || '📊';
}
