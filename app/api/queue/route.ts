import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API pour récupérer l'état de la queue de génération
 * Utilisé par le bouton "Q" pour afficher les projets en cours
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les projets en cours de génération
    const generatingProjects = await prisma.project.findMany({
      where: {
        status: {
          in: ['generating', 'draft']
        }
      },
      include: {
        slides: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculer les statistiques pour chaque projet
    const queueData = generatingProjects.map(project => {
      const totalSlides = project.slides.length;
      const completedImages = project.slides.filter(s => s.imageStatus === 'completed').length;
      const completedAudio = project.slides.filter(s => s.audioStatus === 'completed').length;
      const failedImages = project.slides.filter(s => s.imageStatus === 'failed').length;
      const failedAudio = project.slides.filter(s => s.audioStatus === 'failed').length;

      const overallProgress = Math.round(
        ((completedImages + completedAudio) / (totalSlides * 2)) * 100
      );

      return {
        id: project.id,
        title: project.title,
        concept: project.concept,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        stats: {
          totalSlides,
          completedImages,
          completedAudio,
          failedImages,
          failedAudio,
          overallProgress,
        },
        slides: project.slides.map(slide => ({
          id: slide.id,
          order: slide.order,
          role: slide.role,
          imageStatus: slide.imageStatus,
          audioStatus: slide.audioStatus,
          textContent: slide.textContent.substring(0, 50) + '...',
        })),
      };
    });

    return NextResponse.json({
      queue: queueData,
      totalInQueue: queueData.length,
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue' },
      { status: 500 }
    );
  }
}
