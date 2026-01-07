/**
 * Gestion de l'historique de la queue de génération
 * Permet de tracker chaque étape de la génération
 */

import { prisma } from '@/lib/db';

export type QueueStage = 
  | 'transcription'
  | 'scenario'
  | 'image_prompts'
  | 'script'
  | 'normalization'
  | 'images'
  | 'audio'
  | 'completed';

export type QueueStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Créer une entrée d'historique pour une nouvelle étape
 */
export async function createQueueHistory(
  projectId: string,
  stage: QueueStage,
  status: QueueStatus = 'pending',
  message?: string,
  metadata?: Record<string, any>
) {
  return await prisma.queueHistory.create({
    data: {
      projectId,
      stage,
      status,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

/**
 * Mettre à jour une entrée d'historique
 */
export async function updateQueueHistory(
  historyId: string,
  status: QueueStatus,
  message?: string,
  completedAt?: Date
) {
  return await prisma.queueHistory.update({
    where: { id: historyId },
    data: {
      status,
      message,
      ...(completedAt ? { completedAt } : {}),
    },
  });
}

/**
 * Récupérer l'historique complet d'un projet
 */
export async function getProjectHistory(projectId: string) {
  return await prisma.queueHistory.findMany({
    where: { projectId },
    orderBy: { startedAt: 'asc' },
  });
}

/**
 * Récupérer les projets actifs dans la queue
 */
export async function getActiveQueue() {
  return await prisma.project.findMany({
    where: {
      status: {
        in: ['generating', 'draft'],
      },
    },
    include: {
      slides: {
        orderBy: { order: 'asc' },
      },
      queueHistory: {
        orderBy: { startedAt: 'desc' },
        take: 5, // Dernières 5 entrées
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Helper pour tracker une étape complète (début + fin)
 */
export async function trackStage<T>(
  projectId: string,
  stage: QueueStage,
  fn: () => Promise<T>
): Promise<T> {
  const history = await createQueueHistory(projectId, stage, 'in_progress');
  
  try {
    const result = await fn();
    await updateQueueHistory(
      history.id,
      'completed',
      'Success',
      new Date()
    );
    return result;
  } catch (error) {
    await updateQueueHistory(
      history.id,
      'failed',
      error instanceof Error ? error.message : 'Unknown error',
      new Date()
    );
    throw error;
  }
}
