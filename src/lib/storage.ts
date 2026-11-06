import { TripData, Member, ItineraryItem, Expense, ExpenseSplit } from '@/types';
import { calculateEvenSplits } from './settlement';

// Version 4 storage key to ensure fresh initial load with updated title and memo
const STORAGE_KEY = 'travel_dutch_trip_data_v4';

// Initial default data: 3 members (주연, 혜림, 용덕), 태안 갯벌 캠핑 일정, 7건의 지출 내역
export const INITIAL_TRIP_DATA: TripData = {
  id: 'trip-taean-camping-1',
  title: '여행플래너&더치페이',
  startDate: '2026-11-06',
  endDate: '2026-11-07',
  currency: 'KRW',
  members: [
    { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' },
    { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' },
    { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' },
  ],
  itineraryItems: [
    {
      id: 'itin-taean-1',
      tripId: 'trip-taean-camping-1',
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
  ],
  expenses: [
    {
      id: 'exp-1',
      tripId: 'trip-taean-camping-1',
      title: '미리준비 맥주',
      amount: 31720,
      category: '식비',
      payerId: 'm-3', // 용덕
      payer: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' },
      createdAt: '2026-11-06T10:00:00Z',
      splits: [
        { id: 's-1-1', expenseId: 'exp-1', memberId: 'm-1', amount: 10580, member: { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-1-2', expenseId: 'exp-1', memberId: 'm-2', amount: 10570, member: { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' } },
        { id: 's-1-3', expenseId: 'exp-1', memberId: 'm-3', amount: 10570, member: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-2',
      tripId: 'trip-taean-camping-1',
      title: '식비',
      amount: 224710,
      category: '식비',
      payerId: 'm-3', // 용덕
      payer: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' },
      createdAt: '2026-11-06T12:30:00Z',
      splits: [
        { id: 's-2-1', expenseId: 'exp-2', memberId: 'm-1', amount: 74910, member: { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-2-2', expenseId: 'exp-2', memberId: 'm-2', amount: 74900, member: { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' } },
        { id: 's-2-3', expenseId: 'exp-2', memberId: 'm-3', amount: 74900, member: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-3',
      tripId: 'trip-taean-camping-1',
      title: '체험비',
      amount: 256460,
      category: '기타',
      payerId: 'm-3', // 용덕
      payer: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' },
      createdAt: '2026-11-06T14:00:00Z',
      splits: [
        { id: 's-3-1', expenseId: 'exp-3', memberId: 'm-1', amount: 85500, member: { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-3-2', expenseId: 'exp-3', memberId: 'm-2', amount: 85480, member: { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' } },
        { id: 's-3-3', expenseId: 'exp-3', memberId: 'm-3', amount: 85480, member: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-4',
      tripId: 'trip-taean-camping-1',
      title: '매점',
      amount: 132830,
      category: '기타',
      payerId: 'm-3', // 용덕
      payer: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' },
      createdAt: '2026-11-06T16:00:00Z',
      splits: [
        { id: 's-4-1', expenseId: 'exp-4', memberId: 'm-1', amount: 44290, member: { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-4-2', expenseId: 'exp-4', memberId: 'm-2', amount: 44270, member: { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' } },
        { id: 's-4-3', expenseId: 'exp-4', memberId: 'm-3', amount: 44270, member: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-5',
      tripId: 'trip-taean-camping-1',
      title: '매점',
      amount: 144000,
      category: '기타',
      payerId: 'm-3', // 용덕
      payer: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' },
      createdAt: '2026-11-06T18:00:00Z',
      splits: [
        { id: 's-5-1', expenseId: 'exp-5', memberId: 'm-1', amount: 48000, member: { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-5-2', expenseId: 'exp-5', memberId: 'm-2', amount: 48000, member: { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' } },
        { id: 's-5-3', expenseId: 'exp-5', memberId: 'm-3', amount: 48000, member: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-6',
      tripId: 'trip-taean-camping-1',
      title: '마트',
      amount: 229600,
      category: '기타',
      payerId: 'm-2', // 혜림
      payer: { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' },
      createdAt: '2026-11-06T19:30:00Z',
      splits: [
        { id: 's-6-1', expenseId: 'exp-6', memberId: 'm-1', amount: 76540, member: { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-6-2', expenseId: 'exp-6', memberId: 'm-2', amount: 76530, member: { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' } },
        { id: 's-6-3', expenseId: 'exp-6', memberId: 'm-3', amount: 76530, member: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' } },
      ],
    },
    {
      id: 'exp-7',
      tripId: 'trip-taean-camping-1',
      title: '마트',
      amount: 32000,
      category: '기타',
      payerId: 'm-1', // 주연
      payer: { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' },
      createdAt: '2026-11-06T20:30:00Z',
      splits: [
        { id: 's-7-1', expenseId: 'exp-7', memberId: 'm-1', amount: 10680, member: { id: 'm-1', tripId: 'trip-taean-camping-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' } },
        { id: 's-7-2', expenseId: 'exp-7', memberId: 'm-2', amount: 10660, member: { id: 'm-2', tripId: 'trip-taean-camping-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' } },
        { id: 's-7-3', expenseId: 'exp-7', memberId: 'm-3', amount: 10660, member: { id: 'm-3', tripId: 'trip-taean-camping-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' } },
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
