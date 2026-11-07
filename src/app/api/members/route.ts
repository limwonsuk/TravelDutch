import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tripId, name, avatarColor, avatarEmoji } = body;

    if (!tripId || !name) {
      return NextResponse.json({ error: 'tripId and name are required' }, { status: 400 });
    }

    const member = await prisma.member.create({
      data: {
        tripId,
        name,
        avatarColor: avatarColor || '#6366f1',
        avatarEmoji: avatarEmoji || '👤',
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Failed to create member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
