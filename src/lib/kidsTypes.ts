export interface FamilyGroupItem {
  id: number;
  familyKey: string;
  familyName: string;
  regionTag: string;
  motto: string;
  avatar: string;
  accentColor: string;
}

export interface ChildProfileItem {
  id: number;
  familyKey: string;
  name: string;
  gradeLabel: string;
  schoolName: string;
  avatar: string;
  color: string;
  birthYear: number;
}

export interface AcademyItem {
  id: number;
  familyKey: string;
  childName: string;
  title: string;
  category: string;
  daysOfWeek: string;
  startTime: string;
  endTime: string;
  pickupType: string;
  travelMinutes: number;
  monthlyFee: number;
  billingDay: number;
  paymentMethod: string;
  scoreSatisfaction: number;
  scoreAchievement: number;
  scoreTeacherCare: number;
  scoreCostEfficiency: number;
  scoreDistance: number;
  scoreHomework: number;
  color: string;
}

export interface ReadingItem {
  id: number;
  familyKey: string;
  childName: string;
  type: "BOOK" | "EXPERIENCE";
  title: string;
  subjectArea: string;
  date: string;
  rating: number;
  summaryNote: string;
}

export interface OutingSpotItem {
  id: number;
  name: string;
  region: "부산" | "경남" | "경북" | string;
  subRegion: string;
  category: string;
  indoorOutdoor: "INDOOR" | "OUTDOOR" | "BOTH";
  bestWeather: string;
  ageGroup: string;
  driveMinutes: number;
  estimatedCostKr: number;
  reservationTip: string;
  packingTags: string;
  kidReactionScore: number;
  parkingScore: number;
  homepageUrl: string;
  blogSearchUrl: string;
}

export interface StampLogItem {
  id: number;
  familyKey: string;
  spotName: string;
  themeBadge: string;
  visitDate: string;
  weather: string;
  spentCostKr: number;
  kidRating: number;
  parkingRating: number;
  revisitIntent: boolean;
  memoryNote: string;
}
