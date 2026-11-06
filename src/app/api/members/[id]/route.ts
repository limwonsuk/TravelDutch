import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Remove splits first if any
    await prisma.expenseSplit.deleteMany({
      where: { memberId: id },
    });

    // Remove expenses paid by this member
    await prisma.expense.deleteMany({
      where: { payerId: id },
    });

    // Delete member
    await prisma.member.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
