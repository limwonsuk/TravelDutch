import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEvenSplits } from '@/lib/settlement';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tripId, title, amount, category, payerId, splitMemberIds } = body;

    if (!tripId || !title || !amount || !payerId || !Array.isArray(splitMemberIds) || splitMemberIds.length === 0) {
      return NextResponse.json({ error: 'Missing required expense fields' }, { status: 400 });
    }

    const numAmount = Math.round(Number(amount));
    if (numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }

    // Calculate splits with KRW 10-won units
    const splits = calculateEvenSplits(numAmount, splitMemberIds);

    const expense = await prisma.expense.create({
      data: {
        tripId,
        title,
        amount: numAmount,
        category: category || '기타',
        payerId,
        splits: {
          create: splits.map(s => ({
            memberId: s.memberId,
            amount: s.amount,
          })),
        },
      },
      include: {
        payer: true,
        splits: {
          include: {
            member: true,
          },
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
