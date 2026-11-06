import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const trip = await prisma.trip.findFirst({
      include: {
        members: true,
        itineraryItems: {
          orderBy: [
            { dayNumber: 'asc' },
            { orderIndex: 'asc' },
          ],
        },
        expenses: {
          include: {
            payer: true,
            splits: {
              include: {
                member: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Failed to fetch trip:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
