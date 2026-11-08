import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const record = await prisma.kidsHubData.findUnique({
      where: { id: 'global-kids-db' },
    });
    if (!record) {
      return NextResponse.json(null);
    }
    return NextResponse.json(record.data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (err) {
    console.error('Failed to fetch kids data from DB:', err);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await prisma.kidsHubData.upsert({
      where: { id: 'global-kids-db' },
      update: { data: body },
      create: { id: 'global-kids-db', data: body },
    });
    return NextResponse.json(updated.data);
  } catch (err) {
    console.error('Failed to save kids data to DB:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
