import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API pour lier un compte Telegram à un utilisateur
 * Utilisé pour connecter Desktop <-> Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const { telegramId, telegramUsername, email } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    // Chercher un utilisateur existant avec cet email
    let user = email ? await prisma.user.findUnique({
      where: { email }
    }) : null;

    if (user) {
      // Lier le Telegram ID à l'utilisateur existant
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramId,
          telegramUsername,
        }
      });
    } else {
      // Créer un nouvel utilisateur ou trouver par Telegram ID
      user = await prisma.user.upsert({
        where: { telegramId },
        update: {
          telegramUsername,
          ...(email ? { email } : {}),
        },
        create: {
          telegramId,
          telegramUsername,
          ...(email ? { email } : {}),
        }
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
      }
    });
  } catch (error) {
    console.error('Error linking Telegram account:', error);
    return NextResponse.json(
      { error: 'Failed to link Telegram account' },
      { status: 500 }
    );
  }
}

/**
 * Récupérer les informations utilisateur par Telegram ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(telegramId) },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            slides: {
              orderBy: { order: 'asc' },
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
      },
      projects: user.projects,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
