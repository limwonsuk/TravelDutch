import { TripData, Member, ItineraryItem, Expense, ExpenseSplit } from '@/types';
import { calculateEvenSplits } from './settlement';

// Version 2 storage key to ensure fresh initial load with new default members
const STORAGE_KEY = 'travel_dutch_trip_data_v2';

// Initial default data: 3 members (주연, 혜림, 용덕), zero default itinerary, zero default expenses
export const INITIAL_TRIP_DATA: TripData = {
  id: 'trip-default-1',
  title: '우정 여행 플래너',
  startDate: '2026-11-06',
  endDate: '2026-11-09',
  currency: 'KRW',
  members: [
    { id: 'm-1', tripId: 'trip-default-1', name: '주연', avatarColor: '#EC4899', avatarEmoji: '🌸' },
    { id: 'm-2', tripId: 'trip-default-1', name: '혜림', avatarColor: '#3B82F6', avatarEmoji: '🌟' },
    { id: 'm-3', tripId: 'trip-default-1', name: '용덕', avatarColor: '#10B981', avatarEmoji: '🚀' },
  ],
  itineraryItems: [],
  expenses: [],
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
