import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const item = await prisma.itineraryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.itineraryItem.delete({
      where: { id },
    });

    // Reorder remaining items for this day
    const remaining = await prisma.itineraryItem.findMany({
      where: {
        tripId: item.tripId,
        dayNumber: item.dayNumber,
      },
      orderBy: { orderIndex: 'asc' },
    });

    for (let i = 0; i < remaining.length; i++) {
      await prisma.itineraryItem.update({
        where: { id: remaining[i].id },
        data: { orderIndex: i + 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete itinerary item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
