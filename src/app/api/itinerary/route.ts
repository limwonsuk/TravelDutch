import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tripId,
      dayNumber,
      title,
      category,
      time,
      memo,
      lat,
      lng,
      estimatedCost,
    } = body;

    if (!tripId || !title || !dayNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find current max orderIndex for this day
    const lastItem = await prisma.itineraryItem.findFirst({
      where: {
        tripId,
        dayNumber: Number(dayNumber),
      },
      orderBy: {
        orderIndex: 'desc',
      },
    });

    const nextOrder = (lastItem?.orderIndex ?? 0) + 1;

    const newItem = await prisma.itineraryItem.create({
      data: {
        tripId,
        dayNumber: Number(dayNumber),
        orderIndex: nextOrder,
        title,
        category: category || '관광',
        time: time || '12:00',
        memo: memo || '',
        lat: Number(lat) || 35.1587,
        lng: Number(lng) || 129.1604,
        estimatedCost: Number(estimatedCost) || 0,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Failed to create itinerary item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
