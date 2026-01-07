import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { regenerateImage } from '@/lib/ai/fal';

export async function POST(
  request: NextRequest,
  { params }: { params: { slideId: string } }
) {
  try {
    const slide = await prisma.slide.findUnique({
      where: { id: params.slideId },
    });

    if (!slide) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    // Update status to generating
    await prisma.slide.update({
      where: { id: params.slideId },
      data: { imageStatus: 'generating' },
    });

    // Generate new image
    const imageUrl = await regenerateImage(slide.imagePrompt);

    // Update with new image
    const updatedSlide = await prisma.slide.update({
      where: { id: params.slideId },
      data: {
        imageUrl,
        imageStatus: 'completed',
      },
    });

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error('Error regenerating image:', error);
    
    // Mark as failed
    await prisma.slide.update({
      where: { id: params.slideId },
      data: { imageStatus: 'failed' },
    });

    return NextResponse.json(
      { error: 'Failed to regenerate image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
