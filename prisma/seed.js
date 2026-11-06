const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateEvenSplits(totalAmount, memberIds) {
  if (memberIds.length === 0) return [];
  if (memberIds.length === 1) return [{ memberId: memberIds[0], amount: totalAmount }];
  const count = memberIds.length;
  const baseShare = Math.floor(totalAmount / count / 10) * 10;
  const splits = memberIds.map((memberId) => ({ memberId, amount: baseShare }));
  const allocatedSum = baseShare * count;
  const remainder = totalAmount - allocatedSum;
  if (remainder !== 0) splits[0].amount += remainder;
  return splits;
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trip.deleteMany();

  console.log('Seeding Trip: 태안 갯벌 캠핑 우정 여행 (주연, 혜림, 용덕)...');
  const trip = await prisma.trip.create({
    data: {
      title: '태안 갯벌 캠핑 우정 여행',
      startDate: '2026-11-06',
      endDate: '2026-11-07',
      currency: 'KRW',
    },
  });

  console.log('Seeding 3 Members: 주연, 혜림, 용덕...');
  const juyeon = await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '주연',
      avatarColor: '#EC4899',
      avatarEmoji: '🌸',
    },
  });

  const hyelim = await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '혜림',
      avatarColor: '#3B82F6',
      avatarEmoji: '🌟',
    },
  });

  const yongdeok = await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '용덕',
      avatarColor: '#10B981',
      avatarEmoji: '🚀',
    },
  });

  const allMembers = [juyeon, hyelim, yongdeok];
  const allIds = allMembers.map((m) => m.id);

  console.log('Seeding Day 1: 태안 갯벌 캠핑 일정...');
  await prisma.itineraryItem.create({
    data: {
      tripId: trip.id,
      dayNumber: 1,
      orderIndex: 1,
      title: '태안 갯벌 캠핑',
      category: '기타',
      time: '14:00',
      memo: '몽산포 갯벌 해루질 체험 및 오토 캠핑 사이트 구축',
      lat: 36.6853,
      lng: 126.2842,
      estimatedCost: 256460,
    },
  });

  console.log('Seeding 7 Expenses...');
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
        tripId: trip.id,
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

  console.log('Seeding completed successfully! Total 7 expenses & 1 schedule created. 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
