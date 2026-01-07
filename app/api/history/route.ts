import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API pour récupérer l'historique complet des générations
 */

// This route reads from request.url (query params) and hits the database.
// Ensure Next.js treats it as dynamic (avoid static generation bailouts).
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const projects = await prisma.project.findMany({
      include: {
        slides: {
          orderBy: { order: 'asc' },
        },
        queueHistory: {
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      projects,
      total: projects.length,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
