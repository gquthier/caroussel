import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      include: {
        slides: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // For now, we'll just return JSON
    // In a production app, you'd integrate with video editing libraries
    // or services like FFmpeg to create MP4, or generate ZIP files
    
    if (format === 'json') {
      return NextResponse.json({
        project: {
          id: project.id,
          title: project.title,
          concept: project.concept,
          vibe: project.vibe,
        },
        slides: project.slides.map(slide => ({
          order: slide.order,
          role: slide.role,
          textContent: slide.textContent,
          imageUrl: slide.imageUrl,
          voiceoverUrl: slide.voiceoverUrl,
        })),
        exportedAt: new Date().toISOString(),
      });
    }

    // TODO: Implement ZIP and MP4 export
    return NextResponse.json(
      { error: 'Export format not yet implemented', supportedFormats: ['json'] },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { error: 'Failed to export project' },
      { status: 500 }
    );
  }
}
