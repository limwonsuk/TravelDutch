export interface Member {
  id: string;
  tripId: string;
  name: string;
  avatarColor: string;
  avatarEmoji: string;
}

export interface ItineraryItem {
  id: string;
  tripId: string;
  dayNumber: number;
  orderIndex: number;
  title: string;
  category: string;
  time: string;
  memo: string | null;
  lat: number;
  lng: number;
  estimatedCost: number;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  memberId: string;
  amount: number;
  member?: Member;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: string;
  payerId: string;
  payer: Member;
  splits: ExpenseSplit[];
  createdAt: string;
}

export interface TripData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  currency: string;
  members: Member[];
  itineraryItems: ItineraryItem[];
  expenses: Expense[];
}

export const BUSAN_PRESETS = [
  { name: '부산역', category: '교통', lat: 35.1152, lng: 129.0422, memo: 'KTX 및 대중교통 거점' },
  { name: '초량 밀면', category: '식당', lat: 35.1165, lng: 129.0410, memo: '부산 대표 밀면 맛집' },
  { name: '감천문화마을', category: '관광', lat: 35.0975, lng: 129.0106, memo: '어린왕자 포토존 & 골목길' },
  { name: '자갈치시장', category: '식당', lat: 35.0966, lng: 129.0306, memo: '신선한 해산물 & 활어회' },
  { name: '광안리 해수욕장', category: '관광', lat: 35.1532, lng: 129.1186, memo: '광안대교 오션뷰 & 카페거리' },
  { name: '해운대 해수욕장', category: '관광', lat: 35.1587, lng: 129.1604, memo: '대표 백사장 & 산책로' },
  { name: '해운대 블루라인파크(미포)', category: '관광', lat: 35.1601, lng: 129.1764, memo: '해변열차 및 스카이캡슐' },
  { name: '청사포 다릿돌전망대', category: '식당', lat: 35.1613, lng: 129.1903, memo: '바다 전망 조개구이 거리' },
  { name: '더베이 101', category: '관광', lat: 35.1566, lng: 129.1520, memo: '마린시티 화려한 야경 뷰' },
  { name: '신세계 센텀시티', category: '관광', lat: 35.1689, lng: 129.1296, memo: '백화점 쇼핑 & 스파랜드' },
  { name: '흰여울문화마을', category: '관광', lat: 35.0784, lng: 129.0453, memo: '영도 절벽 해안마을 & 카페' },
  { name: '태종대 유원지', category: '관광', lat: 35.0531, lng: 129.0863, memo: '기암절벽과 다누비 열차' },
  { name: '해동용궁사', category: '관광', lat: 35.1883, lng: 129.2233, memo: '동해 바다 절벽 위의 절' },
  { name: '스카이라인 루지 부산', category: '관광', lat: 35.1932, lng: 129.2155, memo: '오시리아 루지 카트 체험' },
  { name: '기장 연화리 해녀촌', category: '식당', lat: 35.2158, lng: 129.2274, memo: '싱싱한 해산물과 가마솥 전복죽' },
  { name: '송정 해수욕장', category: '관광', lat: 35.1785, lng: 129.1997, memo: '서핑의 명소 & 한적한 백사장' },
  { name: '초량 이바구길 (168계단)', category: '관광', lat: 35.1187, lng: 129.0375, memo: '부산항 전경 모노레일 체험' },
];
