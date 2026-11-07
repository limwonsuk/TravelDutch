"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AcademyItem, ChildProfileItem } from "@/lib/kidsTypes";
import {
  addScheduleInDb,
  updateScheduleInDb,
  deleteScheduleInDb,
} from "@/lib/kidsStorage";
import {
  Calendar,
  Car,
  AlertTriangle,
  Clock,
  PlusCircle,
  Bus,
  Pencil,
  Trash2,
  BarChartHorizontal,
  LayoutGrid,
  X,
  Check,
} from "lucide-react";

interface TimetableViewProps {
  familyKey: string;
  schedules: AcademyItem[];
  childrenList: ChildProfileItem[];
  onRefresh: () => void;
  onScheduleAdded?: (item: AcademyItem) => void;
  onScheduleUpdated?: (item: AcademyItem) => void;
  onScheduleDeleted?: (id: number) => void;
}

const DAYS = ["월", "화", "수", "목", "금", "토"];
const GANTT_START_MIN = 10 * 60; // 10:00 (600분)
const GANTT_END_MIN = 20 * 60; // 20:00 (1200분)
const GANTT_SPAN_MIN = GANTT_END_MIN - GANTT_START_MIN; // 600분
const GANTT_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

function parseMinutes(hhmm: string): number {
  const [h, m] = (hhmm || "14:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export default function TimetableView({
  familyKey,
  schedules,
  childrenList,
  onRefresh,
  onScheduleAdded,
  onScheduleUpdated,
  onScheduleDeleted,
}: TimetableViewProps) {
  const [selectedChild, setSelectedChild] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"BOTH" | "GANTT" | "GRID">("BOTH");
  const [ganttDay, setGanttDay] = useState<string>("수"); // 기본 수요일(가장 일정이 풍성한 요일) 또는 전체
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // 신규 학원 추가 폼 상태
  const [childName, setChildName] = useState(
    childrenList[0]?.name || "첫째 하준 (초3)"
  );

  useEffect(() => {
    if (childrenList.length > 0) {
      setChildName(childrenList[0].name);
      setSelectedChild("ALL");
    }
  }, [familyKey, childrenList]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("영어");
  const [daysOfWeek, setDaysOfWeek] = useState("화,목");
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("18:20");
  const [pickupType, setPickupType] = useState("엄마라이딩");
  const [monthlyFee, setMonthlyFee] = useState(220000);
  const [travelMinutes, setTravelMinutes] = useState(15);
  const [color, setColor] = useState("#3182F6");

  // 기존 일정 수정 모달 상태
  const [editingItem, setEditingItem] = useState<AcademyItem | null>(null);

  const filteredSchedules = useMemo(() => {
    if (selectedChild === "ALL") return schedules;
    return schedules.filter((s) => s.childName === selectedChild);
  }, [schedules, selectedChild]);

  // 요일별 스케줄 정렬 및 이동시간 부족(충돌 위험) 자동 감지
  const dayColumns = useMemo(() => {
    return DAYS.map((day) => {
      const items = filteredSchedules
        .filter((s) =>
          s.daysOfWeek
            .split(",")
            .map((d) => d.trim())
            .includes(day)
        )
        .sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime));

      const warnings: Record<number, string> = {};
      for (let i = 0; i < items.length - 1; i++) {
        for (let j = i + 1; j < items.length; j++) {
          if (items[i].childName !== items[j].childName) continue;
          const prevEnd = parseMinutes(items[i].endTime);
          const nextStart = parseMinutes(items[j].startTime);
          const gap = nextStart - prevEnd;
          if (gap < 0) {
            warnings[items[j].id] = `⚠️ 이전 수업(${items[i].title})과 시간 중복!`;
          } else if (gap <= Math.max(20, items[j].travelMinutes)) {
            warnings[items[j].id] = `⚡ 이동간격 ${gap}분 (환승·라이딩 촉박)`;
          }
          break;
        }
      }

      return {
        day,
        items,
        warnings,
      };
    });
  }, [filteredSchedules]);

  // 간트 차트용 데이터 (선택된 요일 또는 월~토 전체)
  const ganttRows = useMemo(() => {
    const targetCols =
      ganttDay === "ALL"
        ? dayColumns
        : dayColumns.filter((c) => c.day === ganttDay);

    const rows: {
      day: string;
      item: AcademyItem;
      leftPct: number;
      widthPct: number;
      warning?: string;
    }[] = [];

    targetCols.forEach((col) => {
      col.items.forEach((it) => {
        const sMin = Math.max(GANTT_START_MIN, parseMinutes(it.startTime));
        const eMin = Math.min(
          GANTT_END_MIN,
          Math.max(sMin + 30, parseMinutes(it.endTime))
        );
        const leftPct = ((sMin - GANTT_START_MIN) / GANTT_SPAN_MIN) * 100;
        const widthPct = Math.max(
          4,
          ((eMin - sMin) / GANTT_SPAN_MIN) * 100
        );
        rows.push({
          day: col.day,
          item: it,
          leftPct,
          widthPct,
          warning: col.warnings[it.id],
        });
      });
    });

    return rows;
  }, [dayColumns, ganttDay]);

  const pickupSummary = useMemo(() => {
    let shuttleCount = 0;
    let momRideCount = 0;
    let dadRideCount = 0;
    let tightTransitionCount = 0;

    dayColumns.forEach((col) => {
      tightTransitionCount += Object.keys(col.warnings).length;
      col.items.forEach((it) => {
        if (it.pickupType === "학원셔틀") shuttleCount++;
        if (it.pickupType === "엄마라이딩") momRideCount++;
        if (it.pickupType === "아빠라이딩") dadRideCount++;
      });
    });

    return {
      shuttleCount,
      momRideCount,
      dadRideCount,
      tightTransitionCount,
    };
  }, [dayColumns]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addScheduleInDb({
      familyKey,
      childName,
      title,
      category,
      daysOfWeek,
      startTime,
      endTime,
      pickupType,
      travelMinutes,
      monthlyFee,
      color,
    });
    setTitle("");
    setShowAddForm(false);
    onRefresh();
  };

  const handleUpdateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateScheduleInDb(editingItem);
    setEditingItem(null);
    onRefresh();
  };

  const handleDeleteSchedule = (id: number) => {
    deleteScheduleInDb(id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* 상단 요약 카드 4종 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>등록된 주간 학원·방과후 과정</span>
            <Calendar className="w-4 h-4 text-[#d5ff00]" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            총 {filteredSchedules.length}개 과정
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            일정 카드에서 즉시 [수정] · [삭제] 가능
          </div>
        </div>

        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>주간 엄마·아빠 라이딩 횟수</span>
            <Car className="w-4 h-4 text-[#F24553]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F24553]">
            주 {pickupSummary.momRideCount + pickupSummary.dadRideCount}회 라이딩
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            엄마 {pickupSummary.momRideCount}회 · 아빠 {pickupSummary.dadRideCount}회 분담
          </div>
        </div>

        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>학원 셔틀버스 탑승 구간</span>
            <Bus className="w-4 h-4 text-[#3182F6]" />
          </div>
          <div className="text-2xl font-extrabold text-[#3182F6]">
            주 {pickupSummary.shuttleCount}회 셔틀 이용
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            영어·태권도·유치원 셔틀 노선 연동
          </div>
        </div>

        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>환승·이동시간 촉박/충돌 감지</span>
            <AlertTriangle className="w-4 h-4 text-[#d5ff00]" />
          </div>
          <div className="text-2xl font-extrabold text-[#d5ff00]">
            {pickupSummary.tightTransitionCount}건 주의 구간
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            간트 차트에서 겹침/환승 구간 직관 확인
          </div>
        </div>
      </div>

      {/* 자녀 선택 필터 & 뷰 전환(간트차트 / 그리드) & 학원 추가 버튼 */}
      <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 자녀 선택 탭 (DB ChildProfile 연동) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-white mr-1">
              👨‍👩‍👧‍👦 자녀 필터:
            </span>
            <button
              onClick={() => setSelectedChild("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedChild === "ALL"
                  ? "bg-[#d5ff00] text-black"
                  : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              남매 통합 ({schedules.length}건)
            </button>
            {childrenList.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChild(ch.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  selectedChild === ch.name
                    ? "bg-[#d5ff00] text-black"
                    : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {ch.avatar} {ch.name}
              </button>
            ))}
          </div>

          {/* 보기 방식 전환 (간트 차트 / 카드 그리드) + 일정 추가 버튼 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-[#202027] p-1 rounded-xl border border-zinc-700 text-xs font-bold">
              <button
                onClick={() => setViewMode("BOTH")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === "BOTH"
                    ? "bg-[#3182F6] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                간트+카드 모두 보기
              </button>
              <button
                onClick={() => setViewMode("GANTT")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  viewMode === "GANTT"
                    ? "bg-[#3182F6] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <BarChartHorizontal className="w-3.5 h-3.5" />
                간트 차트만
              </button>
              <button
                onClick={() => setViewMode("GRID")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  viewMode === "GRID"
                    ? "bg-[#3182F6] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                요일 카드만
              </button>
            </div>

            <button
              onClick={() => setShowAddForm((p) => !p)}
              className="px-4 py-2 rounded-xl bg-[#F24553] hover:bg-[#d93845] text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />+ 새 학원 · 방과후 일정 추가
            </button>
          </div>
        </div>

        {/* 인라인 학원 일정 추가 폼 */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="mt-4 pt-4 border-t border-[#282832] grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs items-end"
          >
            <div>
              <label className="block text-zinc-400 mb-1">자녀 선택</label>
              <select
                aria-label="자녀 선택"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full bg-[#202027] border border-zinc-700 rounded-lg px-2.5 py-2 text-white"
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 mb-1">학원/수업명</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 줄리아 발레 / 어린이 수영장"
                className="w-full bg-[#202027] border border-zinc-700 rounded-lg px-2.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">요일 (콤마 구분)</label>
              <input
                type="text"
                value={daysOfWeek}
                onChange={(e) => setDaysOfWeek(e.target.value)}
                placeholder="월,수,금"
                className="w-full bg-[#202027] border border-zinc-700 rounded-lg px-2.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">시작~종료시간</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-1/2 bg-[#202027] border border-zinc-700 rounded-lg px-2 py-2 text-white"
                />
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-1/2 bg-[#202027] border border-zinc-700 rounded-lg px-2 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">등하원/라이딩</label>
              <select
                aria-label="등하원 라이딩"
                value={pickupType}
                onChange={(e) => setPickupType(e.target.value)}
                className="w-full bg-[#202027] border border-zinc-700 rounded-lg px-2.5 py-2 text-white"
              >
                <option value="엄마라이딩">엄마라이딩</option>
                <option value="아빠라이딩">아빠라이딩</option>
                <option value="학원셔틀">학원셔틀</option>
                <option value="도보등하원">도보등하원</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">월 수강료(원)</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full bg-[#202027] border border-zinc-700 rounded-lg px-2.5 py-2 text-[#d5ff00] font-bold"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-[#00d000] text-black font-bold"
              >
                시간표 반영
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 기존 일정 수정 모달 */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#17171C] border border-[#d5ff00] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#d5ff00]" />
                학원 · 방과후 일정 상세 수정
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSchedule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">자녀</label>
                  <select
                    aria-label="수정 자녀 선택"
                    value={editingItem.childName}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        childName: e.target.value,
                      })
                    }
                    className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    {childrenList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">과목 분류</label>
                  <select
                    aria-label="수정 과목 분류"
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    {[
                      "학교/돌봄",
                      "영어",
                      "수학/사고력",
                      "예체능",
                      "코딩/과학",
                      "독서/논술",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">학원 / 수업명</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">수업 요일</label>
                  <input
                    type="text"
                    value={editingItem.daysOfWeek}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        daysOfWeek: e.target.value,
                      })
                    }
                    className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-[#d5ff00] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">시작 시간</label>
                  <input
                    type="text"
                    value={editingItem.startTime}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">종료 시간</label>
                  <input
                    type="text"
                    value={editingItem.endTime}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">픽업/라이딩</label>
                  <select
                    aria-label="수정 픽업 방식"
                    value={editingItem.pickupType}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        pickupType: e.target.value,
                      })
                    }
                    className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="엄마라이딩">엄마라이딩</option>
                    <option value="아빠라이딩">아빠라이딩</option>
                    <option value="학원셔틀">학원셔틀</option>
                    <option value="도보등하원">도보등하원</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">월 교육비(원)</label>
                  <input
                    type="number"
                    value={editingItem.monthlyFee}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        monthlyFee: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-[#d5ff00] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">막대 색상</label>
                  <input
                    type="color"
                    value={editingItem.color || "#3182F6"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        color: e.target.value,
                      })
                    }
                    className="w-full h-9 bg-[#202027] border border-zinc-700 rounded-xl px-2 py-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#202027] text-zinc-300 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00d000] text-black font-bold flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> 수정 내용 DB 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📊 1) 시간대별 간트 차트(Gantt Chart) 타임라인 뷰 */}
      {(viewMode === "BOTH" || viewMode === "GANTT") && (
        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <BarChartHorizontal className="w-5 h-5 text-[#d5ff00]" />
                시간표 간트 차트 (Gantt Timeline · 10:00 ~ 20:00)
              </h3>
              <p className="text-xs text-zinc-400">
                가로 타임라인 막대(Bar)로 남매의 수업 시작~종료 시간, 공백 시간, 라이딩 겹침 구간을 한눈에 비교합니다.
              </p>
            </div>

            {/* 간트 차트 요일 필터 버튼 */}
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => setGanttDay(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    ganttDay === d
                      ? "bg-[#d5ff00] text-black"
                      : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {d}요일 간트
                </button>
              ))}
              <button
                onClick={() => setGanttDay("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  ganttDay === "ALL"
                    ? "bg-[#9f2cf5] text-white"
                    : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                월~토 전체 간트
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[780px]">
              {/* 상단 시간 눈금 헤더 (10:00 ~ 20:00) */}
              <div className="grid grid-cols-12 bg-[#202027] rounded-t-xl border border-[#2C2C38] py-2.5 px-3 text-xs font-bold text-zinc-300">
                <div className="col-span-4">요일 · 자녀 · 수업명 (수정/삭제)</div>
                <div className="col-span-8 relative h-5">
                  {GANTT_HOURS.map((hr) => {
                    const leftPct =
                      (((hr * 60 - GANTT_START_MIN) / GANTT_SPAN_MIN) * 100);
                    return (
                      <span
                        key={hr}
                        className="absolute -translate-x-1/2 text-[11px] font-mono text-zinc-400"
                        style={{ left: `${leftPct}%` }}
                      >
                        {hr}:00
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 간트 차트 행(Row) 리스트 */}
              <div className="divide-y divide-[#252530] border-x border-b border-[#2C2C38] rounded-b-xl bg-[#131318]">
                {ganttRows.map(({ day, item, leftPct, widthPct, warning }, idx) => (
                  <div
                    key={`${day}-${item.id}-${idx}`}
                    className="grid grid-cols-12 items-center py-3 px-3 hover:bg-[#202027]/60 transition"
                  >
                    {/* 좌측 정보 & 수정/삭제 버튼 */}
                    <div className="col-span-4 pr-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-[#202027] text-[#d5ff00] font-bold">
                            {day}
                          </span>
                          <span className="text-zinc-300 font-semibold truncate">
                            {item.childName.split(" ")[0]} {item.childName.split(" ")[1]}
                          </span>
                          <span className="text-zinc-400">({item.pickupType})</span>
                        </div>
                        <div className="text-xs font-bold text-white truncate mt-0.5">
                          {item.title}
                        </div>
                        {warning && (
                          <div className="text-[10px] text-[#F24553] font-bold mt-0.5">
                            {warning}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingItem(item)}
                          title="일정 수정"
                          className="p-1.5 rounded-lg bg-[#202027] hover:bg-zinc-700 text-zinc-300 hover:text-[#d5ff00]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(item.id)}
                          title="일정 삭제"
                          className="p-1.5 rounded-lg bg-[#F24553]/15 hover:bg-[#F24553]/30 text-[#F24553]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 우측 타임라인 막대(Gantt Bar) */}
                    <div className="col-span-8 relative h-9 bg-[#1A1A22] rounded-lg overflow-hidden border border-[#262632]">
                      {/* 세로 1시간 간격 그리드선 */}
                      {GANTT_HOURS.map((hr) => {
                        const l =
                          ((hr * 60 - GANTT_START_MIN) / GANTT_SPAN_MIN) * 100;
                        return (
                          <div
                            key={hr}
                            className="absolute top-0 bottom-0 w-[1px] bg-[#262632]"
                            style={{ left: `${l}%` }}
                          />
                        );
                      })}

                      {/* 실제 수업 시간 막대 */}
                      <div
                        onClick={() => setEditingItem(item)}
                        className="cursor-pointer absolute top-1 bottom-1 rounded-md px-2 flex items-center justify-between text-[11px] font-bold text-white shadow-md transition hover:brightness-110 overflow-hidden whitespace-nowrap"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: item.color || "#3182F6",
                        }}
                      >
                        <span className="truncate drop-shadow">
                          {item.startTime}~{item.endTime} {item.title}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 2) 월~토 요일별 카드 그리드 뷰 (수정 · 삭제 버튼 포함) */}
      {(viewMode === "BOTH" || viewMode === "GRID") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {dayColumns.map((col) => (
            <div
              key={col.day}
              className="bg-[#17171C] border border-[#282832] rounded-2xl p-4 flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#282832]">
                <span className="text-base font-extrabold text-white">
                  {col.day}요일
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#202027] text-xs text-[#d5ff00] font-bold">
                  {col.items.length}건
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {col.items.map((item) => {
                  const warnMsg = col.warnings[item.id];
                  const isFirstChild = item.childName.includes("첫째");
                  return (
                    <div
                      key={`${col.day}-${item.id}`}
                      className="bg-[#202027] rounded-xl p-3 border-l-4 transition hover:translate-y-[-1px]"
                      style={{ borderLeftColor: item.color || "#3182F6" }}
                    >
                      {warnMsg && (
                        <div className="mb-2 px-2 py-1 rounded bg-[#F24553]/20 border border-[#F24553]/50 text-[#F24553] text-[11px] font-bold">
                          {warnMsg}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            isFirstChild
                              ? "bg-[#3182F6]/20 text-[#3182F6]"
                              : "bg-[#9f2cf5]/20 text-[#9f2cf5]"
                          }`}
                        >
                          {item.childName.split(" ")[0]}{" "}
                          {item.childName.split(" ")[1] || ""}
                        </span>
                        <span className="font-mono text-[#d5ff00] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.startTime}~{item.endTime}
                        </span>
                      </div>

                      <div className="font-bold text-white text-xs mt-1">
                        {item.title}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold ${
                            item.pickupType.includes("라이딩")
                              ? "bg-[#F24553]/20 text-[#F24553]"
                              : item.pickupType === "학원셔틀"
                              ? "bg-[#00d000]/20 text-[#00d000]"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {item.pickupType}
                        </span>

                        {/* 카드 내 수정/삭제 버튼 */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="px-1.5 py-0.5 rounded bg-[#17171C] hover:bg-zinc-700 text-zinc-300 hover:text-[#d5ff00] flex items-center gap-0.5"
                          >
                            <Pencil className="w-3 h-3" /> 수정
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(item.id)}
                            className="px-1.5 py-0.5 rounded bg-[#F24553]/20 hover:bg-[#F24553]/40 text-[#F24553] flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> 삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
