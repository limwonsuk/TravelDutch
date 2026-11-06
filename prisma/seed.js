const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trip.deleteMany();

  console.log('Seeding Trip: 우정 여행 플래너 (주연, 혜림, 용덕)...');
  const trip = await prisma.trip.create({
    data: {
      title: '우정 여행 플래너',
      startDate: '2026-11-06',
      endDate: '2026-11-09',
      currency: 'KRW',
    },
  });

  console.log('Seeding 3 Members: 주연, 혜림, 용덕...');
  await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '주연',
      avatarColor: '#EC4899',
      avatarEmoji: '🌸',
    },
  });

  await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '혜림',
      avatarColor: '#3B82F6',
      avatarEmoji: '🌟',
    },
  });

  await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '용덕',
      avatarColor: '#10B981',
      avatarEmoji: '🚀',
    },
  });

  console.log('Seeding completed: 3 members, 0 itinerary items, 0 expenses. Clean slate ready! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
