import { TripData, Member, ItineraryItem, Expense, ExpenseSplit } from '@/types';
import { calculateEvenSplits } from './settlement';

const STORAGE_KEY = 'travel_dutch_trip_data_v1';

// Initial pristine seed data for 3박 4일 5인 여행
export const INITIAL_TRIP_DATA: TripData = {
  id: 'trip-busan-3n4d',
  title: '부산 3박 4일 우정 여행',
  startDate: '2026-11-06',
  endDate: '2026-11-09',
  currency: 'KRW',
  members: [
    { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' },
    { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' },
    { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' },
    { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' },
    { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' },
  ],
  itineraryItems: [
    // Day 1
    { id: 'itin-1', tripId: 'trip-busan-3n4d', dayNumber: 1, orderIndex: 1, title: '부산역 도착', category: '교통', time: '10:30', memo: 'KTX 부산역 광장 5인 집결', lat: 35.1152, lng: 129.0422, estimatedCost: 0 },
    { id: 'itin-2', tripId: 'trip-busan-3n4d', dayNumber: 1, orderIndex: 2, title: '초량 밀면 점심', category: '식당', time: '12:00', memo: '물밀면, 비빔밀면, 왕만두 5인분', lat: 35.1165, lng: 129.0410, estimatedCost: 55000 },
    { id: 'itin-3', tripId: 'trip-busan-3n4d', dayNumber: 1, orderIndex: 3, title: '감천문화마을', category: '관광', time: '14:00', memo: '어린왕자 포토존 & 골목 투어', lat: 35.0975, lng: 129.0106, estimatedCost: 0 },
    { id: 'itin-4', tripId: 'trip-busan-3n4d', dayNumber: 1, orderIndex: 4, title: '자갈치시장 저녁', category: '식당', time: '18:00', memo: '신선한 회 & 생선구이', lat: 35.0966, lng: 129.0306, estimatedCost: 110000 },
    { id: 'itin-5', tripId: 'trip-busan-3n4d', dayNumber: 1, orderIndex: 5, title: '광안리 오션뷰 숙소 체크인', category: '숙소', time: '20:30', memo: '광안대교 야경 감상 & 짐 풀기', lat: 35.1532, lng: 129.1186, estimatedCost: 500000 },

    // Day 2
    { id: 'itin-6', tripId: 'trip-busan-3n4d', dayNumber: 2, orderIndex: 1, title: '해운대 해수욕장 산책', category: '관광', time: '10:00', memo: '백사장 산책 및 5인 단체 사진', lat: 35.1587, lng: 129.1604, estimatedCost: 0 },
    { id: 'itin-7', tripId: 'trip-busan-3n4d', dayNumber: 2, orderIndex: 2, title: '해운대 블루라인파크 해변열차', category: '관광', time: '12:00', memo: '미포정거장 탑승 → 청사포 이동', lat: 35.1601, lng: 129.1764, estimatedCost: 80000 },
    { id: 'itin-8', tripId: 'trip-busan-3n4d', dayNumber: 2, orderIndex: 3, title: '청사포 조개구이', category: '식당', time: '13:30', memo: '바다 보면서 모둠 조개구이 점심', lat: 35.1613, lng: 129.1903, estimatedCost: 175000 },
    { id: 'itin-9', tripId: 'trip-busan-3n4d', dayNumber: 2, orderIndex: 4, title: '더베이 101 야경', category: '관광', time: '19:00', memo: '마린시티 반영샷 & 시원한 맥주', lat: 35.1566, lng: 129.1520, estimatedCost: 35000 },

    // Day 3
    { id: 'itin-10', tripId: 'trip-busan-3n4d', dayNumber: 3, orderIndex: 1, title: '광안리 브런치 카페', category: '카페', time: '10:30', memo: '에그베네딕트와 핸드드립 커피', lat: 35.1538, lng: 129.1195, estimatedCost: 35000 },
    { id: 'itin-11', tripId: 'trip-busan-3n4d', dayNumber: 3, orderIndex: 2, title: '해동용궁사', category: '관광', time: '13:00', memo: '동해 바다 절벽 위의 아름다운 사찰 탐방', lat: 35.1883, lng: 129.2233, estimatedCost: 0 },
    { id: 'itin-12', tripId: 'trip-busan-3n4d', dayNumber: 3, orderIndex: 3, title: '스카이라인 루지 부산', category: '관광', time: '15:30', memo: '오시리아 관광단지 루지 카트 레이싱', lat: 35.1932, lng: 129.2155, estimatedCost: 70000 },
    { id: 'itin-13', tripId: 'trip-busan-3n4d', dayNumber: 3, orderIndex: 4, title: '기장 연화리 해녀촌 전복죽', category: '식당', time: '18:30', memo: '모둠 해산물과 가마솥 전복죽 저녁', lat: 35.2158, lng: 129.2274, estimatedCost: 120000 },

    // Day 4
    { id: 'itin-14', tripId: 'trip-busan-3n4d', dayNumber: 4, orderIndex: 1, title: '송정 해수욕장 모닝 산책', category: '관광', time: '10:00', memo: '서퍼들의 성지 송정 해변 뷰 감상', lat: 35.1785, lng: 129.1997, estimatedCost: 0 },
    { id: 'itin-15', tripId: 'trip-busan-3n4d', dayNumber: 4, orderIndex: 2, title: '센텀시티 신세계백화점', category: '관광', time: '12:30', memo: '스파랜드 휴식 & 기념품 쇼핑', lat: 35.1689, lng: 129.1296, estimatedCost: 0 },
    { id: 'itin-16', tripId: 'trip-busan-3n4d', dayNumber: 4, orderIndex: 3, title: '초량 이바구길 모노레일', category: '관광', time: '15:00', memo: '168계단 모노레일 및 부산항 전경', lat: 35.1187, lng: 129.0375, estimatedCost: 0 },
    { id: 'itin-17', tripId: 'trip-busan-3n4d', dayNumber: 4, orderIndex: 4, title: '부산역 복귀 및 KTX 탑승', category: '교통', time: '17:00', memo: '삼진어묵 구매 후 귀가 열차 탑승', lat: 35.1152, lng: 129.0422, estimatedCost: 30000 },
  ],
  expenses: [
    {
      id: 'exp-1',
      tripId: 'trip-busan-3n4d',
      title: '광안리 오션뷰 숙소 3박',
      amount: 500000,
      category: '숙박',
      payerId: 'm-1',
      payer: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' },
      createdAt: '2026-11-06T10:00:00Z',
      splits: [
        { id: 's-1-1', expenseId: 'exp-1', memberId: 'm-1', amount: 100000, member: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' } },
        { id: 's-1-2', expenseId: 'exp-1', memberId: 'm-2', amount: 100000, member: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-1-3', expenseId: 'exp-1', memberId: 'm-3', amount: 100000, member: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' } },
        { id: 's-1-4', expenseId: 'exp-1', memberId: 'm-4', amount: 100000, member: { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' } },
        { id: 's-1-5', expenseId: 'exp-1', memberId: 'm-5', amount: 100000, member: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-2',
      tripId: 'trip-busan-3n4d',
      title: '초량 밀면 점심 식사',
      amount: 55000,
      category: '식비',
      payerId: 'm-2',
      payer: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' },
      createdAt: '2026-11-06T12:30:00Z',
      splits: [
        { id: 's-2-1', expenseId: 'exp-2', memberId: 'm-1', amount: 11000, member: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' } },
        { id: 's-2-2', expenseId: 'exp-2', memberId: 'm-2', amount: 11000, member: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-2-3', expenseId: 'exp-2', memberId: 'm-3', amount: 11000, member: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' } },
        { id: 's-2-4', expenseId: 'exp-2', memberId: 'm-4', amount: 11000, member: { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' } },
        { id: 's-2-5', expenseId: 'exp-2', memberId: 'm-5', amount: 11000, member: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-3',
      tripId: 'trip-busan-3n4d',
      title: '해변열차 5인 탑승권',
      amount: 80000,
      category: '교통',
      payerId: 'm-3',
      payer: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' },
      createdAt: '2026-11-07T12:00:00Z',
      splits: [
        { id: 's-3-1', expenseId: 'exp-3', memberId: 'm-1', amount: 16000, member: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' } },
        { id: 's-3-2', expenseId: 'exp-3', memberId: 'm-2', amount: 16000, member: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-3-3', expenseId: 'exp-3', memberId: 'm-3', amount: 16000, member: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' } },
        { id: 's-3-4', expenseId: 'exp-3', memberId: 'm-4', amount: 16000, member: { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' } },
        { id: 's-3-5', expenseId: 'exp-3', memberId: 'm-5', amount: 16000, member: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-4',
      tripId: 'trip-busan-3n4d',
      title: '청사포 모둠 조개구이',
      amount: 175000,
      category: '식비',
      payerId: 'm-4',
      payer: { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' },
      createdAt: '2026-11-07T14:00:00Z',
      splits: [
        { id: 's-4-1', expenseId: 'exp-4', memberId: 'm-1', amount: 35000, member: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' } },
        { id: 's-4-2', expenseId: 'exp-4', memberId: 'm-2', amount: 35000, member: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-4-3', expenseId: 'exp-4', memberId: 'm-3', amount: 35000, member: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' } },
        { id: 's-4-4', expenseId: 'exp-4', memberId: 'm-4', amount: 35000, member: { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' } },
        { id: 's-4-5', expenseId: 'exp-4', memberId: 'm-5', amount: 35000, member: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-5',
      tripId: 'trip-busan-3n4d',
      title: '광안리 브런치 카페 디저트',
      amount: 35000,
      category: '식비',
      payerId: 'm-2',
      payer: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' },
      createdAt: '2026-11-08T11:00:00Z',
      splits: [
        { id: 's-5-2', expenseId: 'exp-5', memberId: 'm-2', amount: 8750, member: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-5-3', expenseId: 'exp-5', memberId: 'm-3', amount: 8750, member: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' } },
        { id: 's-5-4', expenseId: 'exp-5', memberId: 'm-4', amount: 8750, member: { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' } },
        { id: 's-5-5', expenseId: 'exp-5', memberId: 'm-5', amount: 8750, member: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-6',
      tripId: 'trip-busan-3n4d',
      title: '기장 연화리 해녀촌 전복죽 저녁',
      amount: 120000,
      category: '식비',
      payerId: 'm-5',
      payer: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' },
      createdAt: '2026-11-08T19:00:00Z',
      splits: [
        { id: 's-6-1', expenseId: 'exp-6', memberId: 'm-1', amount: 24000, member: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' } },
        { id: 's-6-2', expenseId: 'exp-6', memberId: 'm-2', amount: 24000, member: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-6-3', expenseId: 'exp-6', memberId: 'm-3', amount: 24000, member: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' } },
        { id: 's-6-4', expenseId: 'exp-6', memberId: 'm-4', amount: 24000, member: { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' } },
        { id: 's-6-5', expenseId: 'exp-6', memberId: 'm-5', amount: 24000, member: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-7',
      tripId: 'trip-busan-3n4d',
      title: '부산 루지 3인 탑승권',
      amount: 70000,
      category: '입장료',
      payerId: 'm-3',
      payer: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' },
      createdAt: '2026-11-08T16:00:00Z',
      splits: [
        { id: 's-7-1', expenseId: 'exp-7', memberId: 'm-1', amount: 23340, member: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' } },
        { id: 's-7-3', expenseId: 'exp-7', memberId: 'm-3', amount: 23330, member: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' } },
        { id: 's-7-5', expenseId: 'exp-7', memberId: 'm-5', amount: 23330, member: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-8',
      tripId: 'trip-busan-3n4d',
      title: '해운대-기장 이동 콜택시',
      amount: 30000,
      category: '교통',
      payerId: 'm-1',
      payer: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' },
      createdAt: '2026-11-08T18:00:00Z',
      splits: [
        { id: 's-8-1', expenseId: 'exp-8', memberId: 'm-1', amount: 6000, member: { id: 'm-1', tripId: 'trip-busan-3n4d', name: '민수', avatarColor: '#3B82F6', avatarEmoji: '🏄' } },
        { id: 's-8-2', expenseId: 'exp-8', memberId: 'm-2', amount: 6000, member: { id: 'm-2', tripId: 'trip-busan-3n4d', name: '지영', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-8-3', expenseId: 'exp-8', memberId: 'm-3', amount: 6000, member: { id: 'm-3', tripId: 'trip-busan-3n4d', name: '현우', avatarColor: '#10B981', avatarEmoji: '📷' } },
        { id: 's-8-4', expenseId: 'exp-8', memberId: 'm-4', amount: 6000, member: { id: 'm-4', tripId: 'trip-busan-3n4d', name: '수진', avatarColor: '#F59E0B', avatarEmoji: '🍕' } },
        { id: 's-8-5', expenseId: 'exp-8', memberId: 'm-5', amount: 6000, member: { id: 'm-5', tripId: 'trip-busan-3n4d', name: '태호', avatarColor: '#8B5CF6', avatarEmoji: '🚀' } },
      ],
    },
  ],
};

export function getTrip(): TripData {
  if (typeof window === 'undefined') {
    return INITIAL_TRIP_DATA;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRIP_DATA));
    return INITIAL_TRIP_DATA;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_TRIP_DATA;
  }
}

export function saveTrip(data: TripData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function addMember(name: string, avatarColor: string, avatarEmoji: string): TripData {
  const current = getTrip();
  const newMember: Member = {
    id: `m-${Date.now()}`,
    tripId: current.id,
    name,
    avatarColor,
    avatarEmoji,
  };
  current.members.push(newMember);
  saveTrip(current);
  return current;
}

export function deleteMember(memberId: string): TripData {
  const current = getTrip();
  current.members = current.members.filter((m) => m.id !== memberId);
  current.expenses = current.expenses.filter((e) => e.payerId !== memberId);
  current.expenses.forEach((e) => {
    e.splits = e.splits.filter((s) => s.memberId !== memberId);
  });
  saveTrip(current);
  return current;
}

export function addItineraryItem(item: Omit<ItineraryItem, 'id' | 'orderIndex'>): TripData {
  const current = getTrip();
  const dayItems = current.itineraryItems.filter((i) => i.dayNumber === item.dayNumber);
  const nextOrder = dayItems.length > 0 ? Math.max(...dayItems.map((i) => i.orderIndex)) + 1 : 1;

  const newItem: ItineraryItem = {
    ...item,
    id: `itin-${Date.now()}`,
    orderIndex: nextOrder,
  };

  current.itineraryItems.push(newItem);
  saveTrip(current);
  return current;
}

export function deleteItineraryItem(itemId: string): TripData {
  const current = getTrip();
  const target = current.itineraryItems.find((i) => i.id === itemId);
  if (!target) return current;

  current.itineraryItems = current.itineraryItems.filter((i) => i.id !== itemId);
  // Reorder
  const dayItems = current.itineraryItems
    .filter((i) => i.dayNumber === target.dayNumber)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  dayItems.forEach((item, index) => {
    item.orderIndex = index + 1;
  });

  saveTrip(current);
  return current;
}

export function reorderItineraryItem(itemId: string, direction: 'up' | 'down'): TripData {
  const current = getTrip();
  const target = current.itineraryItems.find((i) => i.id === itemId);
  if (!target) return current;

  const dayItems = current.itineraryItems
    .filter((i) => i.dayNumber === target.dayNumber)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const currentIndex = dayItems.findIndex((i) => i.id === itemId);
  if (currentIndex === -1) return current;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= dayItems.length) return current;

  const swapItem = dayItems[targetIndex];
  const tempOrder = target.orderIndex;
  target.orderIndex = swapItem.orderIndex;
  swapItem.orderIndex = tempOrder;

  saveTrip(current);
  return current;
}

export function addExpense(
  title: string,
  amount: number,
  category: string,
  payerId: string,
  splitMemberIds: string[]
): TripData {
  const current = getTrip();
  const payer = current.members.find((m) => m.id === payerId) || current.members[0];
  const numAmount = Math.round(amount);

  const splitsRaw = calculateEvenSplits(numAmount, splitMemberIds);
  const expenseId = `exp-${Date.now()}`;

  const splits: ExpenseSplit[] = splitsRaw.map((s, idx) => ({
    id: `s-${Date.now()}-${idx}`,
    expenseId,
    memberId: s.memberId,
    amount: s.amount,
    member: current.members.find((m) => m.id === s.memberId),
  }));

  const newExpense: Expense = {
    id: expenseId,
    tripId: current.id,
    title,
    amount: numAmount,
    category,
    payerId,
    payer,
    splits,
    createdAt: new Date().toISOString(),
  };

  current.expenses.unshift(newExpense);
  saveTrip(current);
  return current;
}

export function deleteExpense(expenseId: string): TripData {
  const current = getTrip();
  current.expenses = current.expenses.filter((e) => e.id !== expenseId);
  saveTrip(current);
  return current;
}
