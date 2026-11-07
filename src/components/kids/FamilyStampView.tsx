"use client";

import React, { useMemo, useState } from "react";
import { StampLogItem } from "@/lib/kidsTypes";
import { addStampInDb } from "@/lib/kidsStorage";
import { Award, MapPin, PlusCircle, Star, ThumbsUp } from "lucide-react";

interface FamilyStampViewProps {
  familyKey: string;
  stamps: StampLogItem[];
  onStampAdded: (item: StampLogItem) => void;
}

const BADGE_THEMES = [
  { id: "과학탐험가", icon: "🔬", desc: "과학관·천문대·우주 체험" },
  { id: "숲속생태대장", icon: "🌲", desc: "수목원·자연휴양림·동물원" },
  { id: "역사박사", icon: "🏛️", desc: "박물관·고궁·민속촌 탐방" },
  { id: "액티비티마스터", icon: "🎢", desc: "테마파크·직업체험·워터파크" },
  { id: "예술크리에이터", icon: "🎨", desc: "어린이미술관·공연·전시" },
];

export default function FamilyStampView({
  familyKey,
  stamps,
  onStampAdded,
}: FamilyStampViewProps) {
  const [spotName, setSpotName] = useState("");
  const [themeBadge, setThemeBadge] = useState("과학탐험가");
  const [weather, setWeather] = useState("맑음 (19°C)");
  const [spentCostKr, setSpentCostKr] = useState(48000);
  const [kidRating, setKidRating] = useState(5);
  const [parkingRating, setParkingRating] = useState(4);
  const [memoryNote, setMemoryNote] = useState("");

  const badgeCounts = useMemo(() => {
    return BADGE_THEMES.map((b) => ({
      ...b,
      count: stamps.filter((s) => s.themeBadge === b.id).length,
    }));
  }, [stamps]);

  const totalSpentKr = useMemo(
    () => stamps.reduce((acc, cur) => acc + cur.spentCostKr, 0),
    [stamps]
  );

  const handleAddStamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim()) return;
    const created = addStampInDb({
      familyKey,
      spotName,
      themeBadge,
      visitDate: "2026-11-07",
      weather,
      spentCostKr,
      kidRating,
      parkingRating,
      revisitIntent: true,
      memoryNote:
        memoryNote ||
        `${spotName} 주말 가족 나들이 완료! 아이들이 정말 좋아해서 다음 계절에 재방문 예정.`,
    });
    onStampAdded(created);
    setSpotName("");
    setMemoryNote("");
  };

  return (
    <div className="space-y-6">
      {/* 상단 5대 가족 탐험 배지 스탬프 보드 */}
      <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#d5ff00]" />
              우리 가족 주말 나들이 스탬프 투어 도감 (총 {stamps.length}회 완료 · 누적 지출{" "}
              {totalSpentKr.toLocaleString()}원)
            </h3>
            <p className="text-xs text-zinc-400">
              아이와 함께 과학·자연·역사·액티비티·예술 5대 테마 스탬프를 모으며 추억을 기록합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {badgeCounts.map((b) => (
            <div
              key={b.id}
              className="bg-[#202027] border border-[#2E2E3A] rounded-2xl p-4 text-center"
            >
              <div className="text-3xl mb-1">{b.icon}</div>
              <div className="text-xs font-extrabold text-white">{b.id}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">{b.desc}</div>
              <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-[#d5ff00]/20 text-[#d5ff00] text-xs font-extrabold">
                스탬프 {b.count}개 획득
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 다녀온 나들이 스탬프 추가 폼 */}
      <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-[#F24553]" />
          다녀온 주말 나들이 스탬프 & 별점 후기 남기기
        </h3>
        <form
          onSubmit={handleAddStamp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs items-end"
        >
          <div className="sm:col-span-2">
            <label className="block text-zinc-400 mb-1">다녀온 장소명</label>
            <input
              type="text"
              required
              value={spotName}
              onChange={(e) => setSpotName(e.target.value)}
              placeholder="예: 에버랜드 판다월드 / 국립어린이과학관"
              className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white font-semibold"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">스탬프 테마 배지</label>
            <select
              aria-label="스탬프 테마 배지"
              value={themeBadge}
              onChange={(e) => setThemeBadge(e.target.value)}
              className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-[#d5ff00] font-bold"
            >
              {BADGE_THEMES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">지출 비용(원)</label>
            <input
              type="number"
              value={spentCostKr}
              onChange={(e) => setSpentCostKr(Number(e.target.value))}
              className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              아이 반응 / 주차 평점(1~5)
            </label>
            <div className="flex gap-1.5">
              <input
                type="number"
                min={1}
                max={5}
                value={kidRating}
                onChange={(e) => setKidRating(Number(e.target.value))}
                className="w-1/2 bg-[#202027] border border-zinc-700 rounded-xl px-2 py-2 text-[#d5ff00] font-bold"
              />
              <input
                type="number"
                min={1}
                max={5}
                value={parkingRating}
                onChange={(e) => setParkingRating(Number(e.target.value))}
                className="w-1/2 bg-[#202027] border border-zinc-700 rounded-xl px-2 py-2 text-white"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F24553] hover:bg-[#d93845] text-white font-bold"
            >
              스탬프 찍기
            </button>
          </div>
          <div className="sm:col-span-2 lg:col-span-6">
            <input
              type="text"
              value={memoryNote}
              onChange={(e) => setMemoryNote(e.target.value)}
              placeholder="아이들이 가장 좋아했던 체험, 주차 팁, 근처 맛집 메모를 남겨보세요"
              className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </form>
      </div>

      {/* 다녀온 곳 가족 추억 타임라인 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stamps.map((st) => (
          <div
            key={st.id}
            className="bg-[#17171C] border border-[#282832] rounded-2xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d5ff00]/20 text-[#d5ff00] font-bold">
                  🏅 {st.themeBadge}
                </span>
                <span className="text-zinc-400 font-mono">
                  {st.visitDate} · {st.weather}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-white flex items-center gap-1.5 mb-2">
                <MapPin className="w-4 h-4 text-[#F24553]" />
                {st.spotName}
              </h4>

              <p className="text-xs text-zinc-300 bg-[#202027] p-3 rounded-xl leading-relaxed">
                {st.memoryNote}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[#282832] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#d5ff00] font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  아이 만족도 {st.kidRating}.0
                </span>
                <span className="text-zinc-300">
                  주차 편의 {st.parkingRating}.0
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#F24553] font-bold">
                  지출 {st.spentCostKr.toLocaleString()}원
                </span>
                {st.revisitIntent && (
                  <span className="text-[#00d000] font-bold flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> 재방문 100%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
