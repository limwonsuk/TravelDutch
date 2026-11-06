import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { itemId, direction } = body; // direction: 'up' | 'down'

    if (!itemId || !direction) {
      return NextResponse.json({ error: 'itemId and direction are required' }, { status: 400 });
    }

    const currentItem = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
    });

    if (!currentItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const dayItems = await prisma.itineraryItem.findMany({
      where: {
        tripId: currentItem.tripId,
        dayNumber: currentItem.dayNumber,
      },
      orderBy: { orderIndex: 'asc' },
    });

    const currentIndex = dayItems.findIndex((item) => item.id === itemId);
    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Item not in day list' }, { status: 400 });
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= dayItems.length) {
      // Cannot move further
      return NextResponse.json({ success: true, message: 'Already at extreme' });
    }

    const targetItem = dayItems[targetIndex];

    // Swap orderIndex
    await prisma.$transaction([
      prisma.itineraryItem.update({
        where: { id: currentItem.id },
        data: { orderIndex: targetItem.orderIndex },
      }),
      prisma.itineraryItem.update({
        where: { id: targetItem.id },
        data: { orderIndex: currentItem.orderIndex },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder itinerary item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
