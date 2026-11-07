import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEvenSplits } from '@/lib/settlement';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let trip = await prisma.trip.findFirst({
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

    // Auto-seed initial trip if database is empty (for fresh Supabase setup)
    if (!trip) {
      console.log('Database is empty. Auto-seeding initial trip to Supabase...');
      const newTrip = await prisma.trip.create({
        data: {
          title: '우정여행&더치페이',
          startDate: '2026-11-06',
          endDate: '2026-11-07',
          currency: 'KRW',
        },
      });

      const juyeon = await prisma.member.create({
        data: {
          tripId: newTrip.id,
          name: '주연',
          avatarColor: '#EC4899',
          avatarEmoji: '🌸',
        },
      });

      const hyelim = await prisma.member.create({
        data: {
          tripId: newTrip.id,
          name: '혜림',
          avatarColor: '#3B82F6',
          avatarEmoji: '🌟',
        },
      });

      const yongdeok = await prisma.member.create({
        data: {
          tripId: newTrip.id,
          name: '용덕',
          avatarColor: '#10B981',
          avatarEmoji: '🚀',
        },
      });

      const allIds = [juyeon.id, hyelim.id, yongdeok.id];

      // Day 1 Schedule
      await prisma.itineraryItem.create({
        data: {
          tripId: newTrip.id,
          dayNumber: 1,
          orderIndex: 1,
          title: '태안 갯벌 캠핑',
          category: '기타',
          time: '14:00',
          memo: '안면도 갯벌 해루질 체험 및 오토 캠핑',
          lat: 36.5056,
          lng: 126.3378,
          estimatedCost: 0,
        },
      });

      // 7 Expenses
      const expensesData = [
        { title: '미리준비 맥주', amount: 31720, category: '식비', payerId: yongdeok.id },
        { title: '식비', amount: 224710, category: '식비', payerId: yongdeok.id },
        { title: '체험비', amount: 256460, category: '기타', payerId: yongdeok.id },
        { title: '매점', amount: 132830, category: '기타', payerId: yongdeok.id },
        { title: '매점', amount: 144000, category: '기타', payerId: yongdeok.id },
        { title: '마트', amount: 229600, category: '기타', payerId: hyelim.id },
        { title: '마트', amount: 32000, category: '기타', payerId: juyeon.id },
      ];

      for (const exp of expensesData) {
        const createdExp = await prisma.expense.create({
          data: {
            tripId: newTrip.id,
            title: exp.title,
            amount: exp.amount,
            category: exp.category,
            payerId: exp.payerId,
          },
        });

        const splits = calculateEvenSplits(exp.amount, allIds);
        for (const s of splits) {
          await prisma.expenseSplit.create({
            data: {
              expenseId: createdExp.id,
              memberId: s.memberId,
              amount: s.amount,
            },
          });
        }
      }

      // Re-fetch created trip with all relations
      trip = await prisma.trip.findFirst({
        where: { id: newTrip.id },
        include: {
          members: true,
          itineraryItems: {
            orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
          },
          expenses: {
            include: {
              payer: true,
              splits: {
                include: { member: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Failed to fetch trip from Supabase database:', error);
    return NextResponse.json(
      {
        error: 'Database connection failed. Please ensure DATABASE_URL and DIRECT_URL are set.',
      },
      { status: 500 }
    );
  }
}
