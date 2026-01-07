import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slideId: string } }
) {
  try {
    const body = await request.json();
    const { textContent, imagePrompt, voiceoverText, showCaption, imageUrl } = body;

    const slide = await prisma.slide.update({
      where: { id: params.slideId },
      data: {
        ...(textContent !== undefined && { textContent }),
        ...(imagePrompt !== undefined && { imagePrompt }),
        ...(voiceoverText !== undefined && { voiceoverText }),
        ...(showCaption !== undefined && { showCaption }),
        ...(imageUrl !== undefined && { imageUrl, imageStatus: 'completed' }),
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json(
      { error: 'Failed to update slide' },
      { status: 500 }
    );
  }
}
