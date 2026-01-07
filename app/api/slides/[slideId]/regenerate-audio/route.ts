import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateVoiceover } from '@/lib/ai/elevenlabs';

export async function POST(
  request: NextRequest,
  { params }: { params: { slideId: string } }
) {
  try {
    const body = await request.json();
    const { voiceId } = body;

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
      data: { audioStatus: 'generating' },
    });

    // Generate new voiceover
    const text = slide.voiceoverText || slide.textContent;
    const voiceoverUrl = await generateVoiceover(text, voiceId);

    // Update with new audio
    const updatedSlide = await prisma.slide.update({
      where: { id: params.slideId },
      data: {
        voiceoverUrl,
        voiceId: voiceId || slide.voiceId,
        audioStatus: 'completed',
      },
    });

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error('Error regenerating audio:', error);
    
    // Mark as failed
    await prisma.slide.update({
      where: { id: params.slideId },
      data: { audioStatus: 'failed' },
    });

    return NextResponse.json(
      { error: 'Failed to regenerate audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
