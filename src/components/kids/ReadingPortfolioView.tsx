"use client";

import React, { useMemo, useState } from "react";
import { ReadingItem } from "@/lib/kidsTypes";
import { addReadingInDb } from "@/lib/kidsStorage";
import { BookOpen, FileText, PlusCircle, Star } from "lucide-react";

interface ReadingPortfolioViewProps {
  familyKey: string;
  childrenList: { id: number; name: string }[];
  readings: ReadingItem[];
  onReadingAdded: (item: ReadingItem) => void;
}

const SUBJECT_AREAS = [
  "문학·인성",
  "과학·탐구",
  "역사·문화",
  "자연·생태",
  "예술·창의",
];

export default function ReadingPortfolioView({
  familyKey,
  childrenList,
  readings,
  onReadingAdded,
}: ReadingPortfolioViewProps) {
  const [filterType, setFilterType] = useState<"ALL" | "BOOK" | "EXPERIENCE">(
    "ALL"
  );
  const [childName, setChildName] = useState(
    childrenList[0]?.name || "첫째 하준 (초3)"
  );
  const [type, setType] = useState<"BOOK" | "EXPERIENCE">("BOOK");
  const [title, setTitle] = useState("");
  const [subjectArea, setSubjectArea] = useState("과학·탐구");
  const [summaryNote, setSummaryNote] = useState("");
  const [rating, setRating] = useState(5);

  const filtered = useMemo(() => {
    if (filterType === "ALL") return readings;
    return readings.filter((r) => r.type === filterType);
  }, [readings, filterType]);

  const areaStats = useMemo(() => {
    return SUBJECT_AREAS.map((area) => ({
      area,
      count: readings.filter((r) => r.subjectArea === area).length,
    }));
  }, [readings]);

  const maxAreaCount = Math.max(1, ...areaStats.map((a) => a.count));
  const bookCount = readings.filter((r) => r.type === "BOOK").length;
  const expCount = readings.filter((r) => r.type === "EXPERIENCE").length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const created = addReadingInDb({
      familyKey,
      childName,
      type,
      title,
      subjectArea,
      date: "2026-11-07",
      rating,
      summaryNote:
        summaryNote ||
        (type === "EXPERIENCE"
          ? `[교외체험학습 결과보고서] ${title} 현장을 직접 방문하여 원리를 탐구하고 가족과 토론함.`
          : `${title} 도서를 읽고 주인공의 용기와 지혜를 배움.`),
    });
    onReadingAdded(created);
    setTitle("");
    setSummaryNote("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 영역별 독서·체험 밸런스 차트 */}
        <div className="lg:col-span-5 bg-[#17171C] border border-[#282832] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#d5ff00]" />
              영역별 독서록 · 체험학습 편식 진단
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              누적 독서 {bookCount}권 · 교외체험학습 보고서 {expCount}건
            </p>
            <div className="space-y-3">
              {areaStats.map((st) => (
                <div key={st.area} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-zinc-200">{st.area}</span>
                    <span className="text-[#d5ff00] font-bold">{st.count}건</span>
                  </div>
                  <div className="w-full h-3 bg-[#202027] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#d5ff00] rounded-full transition-all"
                      style={{
                        width: `${Math.max(6, (st.count / maxAreaCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#282832] text-xs text-zinc-400">
            💡 주말 나들이 후 교외체험학습 결과보고서를 바로 기록해 보세요!
          </div>
        </div>

        {/* 우측: 독서록 / 교외체험학습 보고서 즉시 등록 폼 */}
        <div className="lg:col-span-7 bg-[#17171C] border border-[#282832] rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#F24553]" />
            새 독서록 / 학교 제출용 교외체험학습 보고서 작성
          </h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">자녀 선택</label>
                <select
                  aria-label="독서록 자녀 선택"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
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
                <label className="block text-zinc-400 mb-1">기록 구분</label>
                <select
                  aria-label="기록 구분"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "BOOK" | "EXPERIENCE")
                  }
                  className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-[#d5ff00] font-bold"
                >
                  <option value="BOOK">📗 독서록 (읽은 책)</option>
                  <option value="EXPERIENCE">🏫 교외체험학습 결과보고서</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">영역 분류</label>
                <select
                  aria-label="영역 분류"
                  value={subjectArea}
                  onChange={(e) => setSubjectArea(e.target.value)}
                  className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  {SUBJECT_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-zinc-400 mb-1">
                  도서 제목 또는 체험학습 장소·주제
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 정재승의 과학콘서트 / 국립경주박물관 역사 탐방"
                  className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">아이 별점 (1~5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-[#d5ff00] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                감상평 / 교외체험학습 보고서 핵심 문구 (비워두면 자동 생성)
              </label>
              <input
                type="text"
                value={summaryNote}
                onChange={(e) => setSummaryNote(e.target.value)}
                placeholder="느낀 점이나 배운 내용을 입력하세요"
                className="w-full bg-[#202027] border border-zinc-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#F24553] hover:bg-[#d93845] text-white font-bold"
              >
                포트폴리오 저장
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 포트폴리오 리스트 */}
      <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#9f2cf5]" />
            누적 독서록 & 교외체험학습 보고서 아카이브 ({filtered.length}건)
          </h3>
          <div className="flex gap-1.5">
            {[
              { id: "ALL", label: "전체 보기" },
              { id: "BOOK", label: "📗 독서록만" },
              { id: "EXPERIENCE", label: "🏫 교외체험학습 보고서만" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setFilterType(b.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filterType === b.id
                    ? "bg-[#d5ff00] text-black"
                    : "bg-[#202027] text-zinc-300"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#202027] border border-[#2C2C38] rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        item.type === "EXPERIENCE"
                          ? "bg-[#9f2cf5]/20 text-[#9f2cf5]"
                          : "bg-[#00d000]/20 text-[#00d000]"
                      }`}
                    >
                      {item.type === "EXPERIENCE"
                        ? "🏫 교외체험학습"
                        : "📗 독서록"}
                    </span>
                    <span className="text-zinc-400">{item.childName}</span>
                    <span className="px-2 py-0.5 rounded bg-[#17171C] text-zinc-300">
                      {item.subjectArea}
                    </span>
                  </div>
                  <span className="text-zinc-400 font-mono">{item.date}</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.summaryNote}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-[#d5ff00] font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {"★".repeat(item.rating)} ({item.rating}.0)
                </span>
                <span className="text-zinc-500">나이스(NEIS) 제출 양식 호환</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
