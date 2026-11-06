const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateEvenSplits(totalAmount, memberIds) {
  if (memberIds.length === 0) return [];
  if (memberIds.length === 1) return [{ memberId: memberIds[0], amount: totalAmount }];
  const count = memberIds.length;
  const baseShare = Math.floor(totalAmount / count / 10) * 10;
  const splits = memberIds.map(memberId => ({ memberId, amount: baseShare }));
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

  console.log('Seeding Trip: 부산 3박 4일 우정 여행 (5인)...');
  const trip = await prisma.trip.create({
    data: {
      title: '부산 3박 4일 우정 여행',
      startDate: '2026-11-06',
      endDate: '2026-11-09',
      currency: 'KRW',
    },
  });

  console.log('Seeding 5 Members...');
  const minsu = await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '민수',
      avatarColor: '#3B82F6',
      avatarEmoji: '🏄',
    },
  });

  const jiyoung = await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '지영',
      avatarColor: '#EC4899',
      avatarEmoji: '🌸',
    },
  });

  const hyunwoo = await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '현우',
      avatarColor: '#10B981',
      avatarEmoji: '📷',
    },
  });

  const sujin = await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '수진',
      avatarColor: '#F59E0B',
      avatarEmoji: '🍕',
    },
  });

  const taeho = await prisma.member.create({
    data: {
      tripId: trip.id,
      name: '태호',
      avatarColor: '#8B5CF6',
      avatarEmoji: '🚀',
    },
  });

  const allMembers = [minsu, jiyoung, hyunwoo, sujin, taeho];
  const allIds = allMembers.map(m => m.id);

  console.log('Seeding 3박 4일 (Day 1 ~ Day 4) Itinerary Items...');
  const itineraryData = [
    // Day 1
    { dayNumber: 1, orderIndex: 1, title: '부산역 도착', category: '교통', time: '10:30', memo: 'KTX 부산역 광장 5인 집결', lat: 35.1152, lng: 129.0422, estimatedCost: 0 },
    { dayNumber: 1, orderIndex: 2, title: '초량 밀면 점심', category: '식당', time: '12:00', memo: '물밀면, 비빔밀면, 왕만두 5인분', lat: 35.1165, lng: 129.0410, estimatedCost: 55000 },
    { dayNumber: 1, orderIndex: 3, title: '감천문화마을', category: '관광', time: '14:00', memo: '어린왕자 포토존 & 골목 투어', lat: 35.0975, lng: 129.0106, estimatedCost: 0 },
    { dayNumber: 1, orderIndex: 4, title: '자갈치시장 저녁', category: '식당', time: '18:00', memo: '신선한 회 & 생선구이', lat: 35.0966, lng: 129.0306, estimatedCost: 110000 },
    { dayNumber: 1, orderIndex: 5, title: '광안리 오션뷰 숙소 체크인', category: '숙소', time: '20:30', memo: '광안대교 야경 감상 & 짐 풀기', lat: 35.1532, lng: 129.1186, estimatedCost: 500000 },

    // Day 2
    { dayNumber: 2, orderIndex: 1, title: '해운대 해수욕장 산책', category: '관광', time: '10:00', memo: '백사장 산책 및 5인 단체 사진', lat: 35.1587, lng: 129.1604, estimatedCost: 0 },
    { dayNumber: 2, orderIndex: 2, title: '해운대 블루라인파크 해변열차', category: '관광', time: '12:00', memo: '미포정거장 탑승 → 청사포 이동', lat: 35.1601, lng: 129.1764, estimatedCost: 80000 },
    { dayNumber: 2, orderIndex: 3, title: '청사포 조개구이', category: '식당', time: '13:30', memo: '바다 보면서 모둠 조개구이 점심', lat: 35.1613, lng: 129.1903, estimatedCost: 175000 },
    { dayNumber: 2, orderIndex: 4, title: '더베이 101 야경', category: '관광', time: '19:00', memo: '마린시티 반영샷 & 시원한 맥주', lat: 35.1566, lng: 129.1520, estimatedCost: 35000 },

    // Day 3 (기장 및 동부산 코스)
    { dayNumber: 3, orderIndex: 1, title: '광안리 브런치 카페', category: '카페', time: '10:30', memo: '에그베네딕트와 핸드드립 커피', lat: 35.1538, lng: 129.1195, estimatedCost: 35000 },
    { dayNumber: 3, orderIndex: 2, title: '해동용궁사', category: '관광', time: '13:00', memo: '동해 바다 절벽 위의 아름다운 사찰 탐방', lat: 35.1883, lng: 129.2233, estimatedCost: 0 },
    { dayNumber: 3, orderIndex: 3, title: '스카이라인 루지 부산', category: '관광', time: '15:30', memo: '오시리아 관광단지 루지 카트 레이싱', lat: 35.1932, lng: 129.2155, estimatedCost: 70000 },
    { dayNumber: 3, orderIndex: 4, title: '기장 연화리 해녀촌 전복죽', category: '식당', time: '18:30', memo: '모둠 해산물과 가마솥 전복죽 저녁', lat: 35.2158, lng: 129.2274, estimatedCost: 120000 },

    // Day 4 (송정 & 도심 투어 후 복귀)
    { dayNumber: 4, orderIndex: 1, title: '송정 해수욕장 모닝 산책', category: '관광', time: '10:00', memo: '서퍼들의 성지 송정 해변 뷰 감상', lat: 35.1785, lng: 129.1997, estimatedCost: 0 },
    { dayNumber: 4, orderIndex: 2, title: '센텀시티 신세계백화점', category: '관광', time: '12:30', memo: '스파랜드 휴식 & 기념품 쇼핑', lat: 35.1689, lng: 129.1296, estimatedCost: 0 },
    { dayNumber: 4, orderIndex: 3, title: '초량 이바구길 모노레일', category: '관광', time: '15:00', memo: '168계단 모노레일 및 부산항 전경', lat: 35.1187, lng: 129.0375, estimatedCost: 0 },
    { dayNumber: 4, orderIndex: 4, title: '부산역 복귀 및 KTX 탑승', category: '교통', time: '17:00', memo: '삼진어묵 구매 후 귀가 열차 탑승', lat: 35.1152, lng: 129.0422, estimatedCost: 30000 },
  ];

  for (const item of itineraryData) {
    await prisma.itineraryItem.create({
      data: {
        tripId: trip.id,
        ...item,
      },
    });
  }

  console.log('Seeding Expenses for 5 members...');
  const expensesToSeed = [
    // 1. 숙소 결제: 민수 500,000원, 5인 전원 (각 100,000원)
    {
      title: '광안리 오션뷰 숙소 3박',
      amount: 500000,
      category: '숙박',
      payerId: minsu.id,
      memberIds: allIds,
    },
    // 2. 밀면 점심: 지영 55,000원, 5인 전원 (각 11,000원)
    {
      title: '초량 밀면 점심 식사',
      amount: 55000,
      category: '식비',
      payerId: jiyoung.id,
      memberIds: allIds,
    },
    // 3. 해변열차 티켓: 현우 80,000원, 5인 전원 (각 16,000원)
    {
      title: '해변열차 5인 탑승권',
      amount: 80000,
      category: '교통',
      payerId: hyunwoo.id,
      memberIds: allIds,
    },
    // 4. 조개구이 저녁: 수진 175,000원, 5인 전원 (각 35,000원)
    {
      title: '청사포 모둠 조개구이',
      amount: 175000,
      category: '식비',
      payerId: sujin.id,
      memberIds: allIds,
    },
    // 5. 카페 디저트: 지영 35,000원 (지영, 수진, 현우, 태호 4인)
    {
      title: '광안리 브런치 카페 디저트',
      amount: 35000,
      category: '식비',
      payerId: jiyoung.id,
      memberIds: [jiyoung.id, sujin.id, hyunwoo.id, taeho.id],
    },
    // 6. 기장 연화리 전복죽: 태호 120,000원, 5인 전원 (각 24,000원)
    {
      title: '기장 연화리 해녀촌 전복죽 저녁',
      amount: 120000,
      category: '식비',
      payerId: taeho.id,
      memberIds: allIds,
    },
    // 7. 루지 레이싱 티켓: 현우 70,000원 (민수, 현우, 태호 3인)
    {
      title: '부산 루지 3인 탑승권',
      amount: 70000,
      category: '입장료',
      payerId: hyunwoo.id,
      memberIds: [minsu.id, hyunwoo.id, taeho.id],
    },
    // 8. 이동 택시비: 민수 30,000원, 5인 전원 (각 6,000원)
    {
      title: '해운대-기장 이동 콜택시',
      amount: 30000,
      category: '교통',
      payerId: minsu.id,
      memberIds: allIds,
    },
  ];

  for (const exp of expensesToSeed) {
    const createdExp = await prisma.expense.create({
      data: {
        tripId: trip.id,
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        payerId: exp.payerId,
      },
    });

    const splits = calculateEvenSplits(exp.amount, exp.memberIds);
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

  console.log('Seeding 3박 4일, 5인 여행 데이터 완료! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
