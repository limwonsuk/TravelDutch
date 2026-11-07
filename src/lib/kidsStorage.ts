import {
  AcademyItem,
  ChildProfileItem,
  FamilyGroupItem,
  OutingSpotItem,
  ReadingItem,
  StampLogItem,
} from "./kidsTypes";
import {
  DEFAULT_CHILDREN,
  DEFAULT_FAMILIES,
  DEFAULT_READINGS,
  DEFAULT_SCHEDULES,
  DEFAULT_SPOTS,
  DEFAULT_STAMPS,
} from "./kidsDefaultData";

export interface KidsHubDatabase {
  families: FamilyGroupItem[];
  children: ChildProfileItem[];
  schedules: AcademyItem[];
  readings: ReadingItem[];
  spots: OutingSpotItem[];
  stamps: StampLogItem[];
}

const KIDS_DB_KEY = "travel_dutch_kids_hub_db_v3";

function getInitialDb(): KidsHubDatabase {
  return {
    families: [...DEFAULT_FAMILIES],
    children: [...DEFAULT_CHILDREN],
    schedules: [...DEFAULT_SCHEDULES],
    readings: [...DEFAULT_READINGS],
    spots: [...DEFAULT_SPOTS],
    stamps: [...DEFAULT_STAMPS],
  };
}

export function loadKidsDb(): KidsHubDatabase {
  if (typeof window === "undefined") {
    return getInitialDb();
  }
  try {
    const raw = localStorage.getItem(KIDS_DB_KEY);
    if (!raw) {
      const init = getInitialDb();
      localStorage.setItem(KIDS_DB_KEY, JSON.stringify(init));
      return init;
    }
    const parsed: KidsHubDatabase = JSON.parse(raw);
    if (!parsed.families || parsed.families.length === 0) {
      const init = getInitialDb();
      localStorage.setItem(KIDS_DB_KEY, JSON.stringify(init));
      return init;
    }
    return parsed;
  } catch {
    return getInitialDb();
  }
}

export function saveKidsDb(db: KidsHubDatabase): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(KIDS_DB_KEY, JSON.stringify(db));
  }
}

export function createFamilyInDb(payload: {
  familyName: string;
  regionTag: string;
  firstChildName: string;
}): FamilyGroupItem {
  const db = loadKidsDb();
  const nowId = Date.now();
  const newKey = `family-${nowId.toString(36)}`;
  const newFam: FamilyGroupItem = {
    id: nowId,
    familyKey: newKey,
    familyName: payload.familyName,
    regionTag: payload.regionTag || "부산 · 경남 · 경북",
    motto: "우리 가족 맞춤형 주중 교육 & 주말 나들이 플래너",
    avatar: "🏡",
    accentColor: "#3182F6",
  };
  const newChild: ChildProfileItem = {
    id: nowId + 1,
    familyKey: newKey,
    name: payload.firstChildName || "첫째 아이 (초1)",
    gradeLabel: "초등 1학년 (8세)",
    schoolName: "우리초등학교",
    avatar: "🧒",
    color: "#3182F6",
    birthYear: 2019,
  };
  db.families.push(newFam);
  db.children.push(newChild);
  saveKidsDb(db);
  return newFam;
}

export function addChildInDb(
  payload: Omit<ChildProfileItem, "id">
): ChildProfileItem {
  const db = loadKidsDb();
  const created: ChildProfileItem = {
    id: Date.now(),
    ...payload,
  };
  db.children.push(created);
  saveKidsDb(db);
  return created;
}

export function updateChildInDb(updated: ChildProfileItem): void {
  const db = loadKidsDb();
  const existing = db.children.find((c) => c.id === updated.id);
  db.children = db.children.map((c) => (c.id === updated.id ? updated : c));
  if (existing && existing.name !== updated.name) {
    db.schedules = db.schedules.map((s) =>
      s.familyKey === existing.familyKey && s.childName === existing.name
        ? { ...s, childName: updated.name }
        : s
    );
    db.readings = db.readings.map((r) =>
      r.familyKey === existing.familyKey && r.childName === existing.name
        ? { ...r, childName: updated.name }
        : r
    );
  }
  saveKidsDb(db);
}

export function deleteChildInDb(id: number): void {
  const db = loadKidsDb();
  db.children = db.children.filter((c) => c.id !== id);
  saveKidsDb(db);
}

export function addScheduleInDb(
  payload: Omit<
    AcademyItem,
    | "id"
    | "billingDay"
    | "paymentMethod"
    | "scoreSatisfaction"
    | "scoreAchievement"
    | "scoreTeacherCare"
    | "scoreCostEfficiency"
    | "scoreDistance"
    | "scoreHomework"
  >
): AcademyItem {
  const db = loadKidsDb();
  const created: AcademyItem = {
    id: Date.now(),
    ...payload,
    billingDay: 25,
    paymentMethod: "지역화폐(동백전/경남사랑)",
    scoreSatisfaction: 90,
    scoreAchievement: 88,
    scoreTeacherCare: 90,
    scoreCostEfficiency: 86,
    scoreDistance: 88,
    scoreHomework: 85,
  };
  db.schedules.push(created);
  saveKidsDb(db);
  return created;
}

export function updateScheduleInDb(updated: AcademyItem): void {
  const db = loadKidsDb();
  db.schedules = db.schedules.map((s) => (s.id === updated.id ? updated : s));
  saveKidsDb(db);
}

export function deleteScheduleInDb(id: number): void {
  const db = loadKidsDb();
  db.schedules = db.schedules.filter((s) => s.id !== id);
  saveKidsDb(db);
}

export function addReadingInDb(
  payload: Omit<ReadingItem, "id">
): ReadingItem {
  const db = loadKidsDb();
  const created: ReadingItem = {
    id: Date.now(),
    ...payload,
  };
  db.readings.unshift(created);
  saveKidsDb(db);
  return created;
}

export function addStampInDb(payload: Omit<StampLogItem, "id">): StampLogItem {
  const db = loadKidsDb();
  const created: StampLogItem = {
    id: Date.now(),
    ...payload,
  };
  db.stamps.unshift(created);
  saveKidsDb(db);
  return created;
}
