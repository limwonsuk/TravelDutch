"use client";

import React, { useMemo, useState } from "react";
import { AcademyItem } from "@/lib/kidsTypes";
import { Wallet, Award, CreditCard, Sparkles } from "lucide-react";

interface EduBudgetViewProps {
  schedules: AcademyItem[];
}

const COLORS = [
  "#F24553",
  "#3182F6",
  "#d5ff00",
  "#9f2cf5",
  "#00d000",
  "#FF9F43",
];

export default function EduBudgetView({ schedules }: EduBudgetViewProps) {
  const [compareIdA, setCompareIdA] = useState<number>(
    schedules[0]?.id || 1
  );
  const [compareIdB, setCompareIdB] = useState<number>(
    schedules[1]?.id || schedules[0]?.id || 2
  );
  const [localCurrencyDiscountPct, setLocalCurrencyDiscountPct] =
    useState<number>(10);
  const [cardBillingDiscountKr] = useState<number>(45000);

  const budgetStats = useMemo(() => {
    let totalGrossKr = 0;
    let firstChildKr = 0;
    let secondChildKr = 0;
    let localPayEligibleKr = 0;

    const categoryMap: Record<string, number> = {};

    schedules.forEach((s) => {
      totalGrossKr += s.monthlyFee;
      if (s.childName.includes("첫째")) firstChildKr += s.monthlyFee;
      else secondChildKr += s.monthlyFee;

      if (s.paymentMethod.includes("지역화폐")) {
        localPayEligibleKr += s.monthlyFee;
      }
      categoryMap[s.category] = (categoryMap[s.category] || 0) + s.monthlyFee;
    });

    const localCurrencySavedKr = Math.round(
      localPayEligibleKr * (localCurrencyDiscountPct / 100)
    );
    const taxCreditMonthlyKr = 32000;
    const totalSavedKr =
      localCurrencySavedKr + cardBillingDiscountKr + taxCreditMonthlyKr;
    const netActualFeeKr = Math.max(0, totalGrossKr - totalSavedKr);

    const categoryPieData = Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value,
        pct:
          totalGrossKr > 0
            ? Number(((value / totalGrossKr) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalGrossKr,
      firstChildKr,
      secondChildKr,
      localCurrencySavedKr,
      taxCreditMonthlyKr,
      totalSavedKr,
      netActualFeeKr,
      categoryPieData,
    };
  }, [schedules, localCurrencyDiscountPct, cardBillingDiscountKr]);

  const acadA = useMemo(
    () => schedules.find((s) => s.id === compareIdA) || schedules[0],
    [schedules, compareIdA]
  );
  const acadB = useMemo(
    () =>
      schedules.find((s) => s.id === compareIdB) ||
      schedules[1] ||
      schedules[0],
    [schedules, compareIdB]
  );

  const radarAxes = useMemo(() => {
    if (!acadA || !acadB) return [];
    return [
      {
        label: "아이 흥미·만족도",
        valA: acadA.scoreSatisfaction,
        valB: acadB.scoreSatisfaction,
      },
      {
        label: "학습 성취도",
        valA: acadA.scoreAchievement,
        valB: acadB.scoreAchievement,
      },
      {
        label: "강사 피드백·케어",
        valA: acadA.scoreTeacherCare,
        valB: acadB.scoreTeacherCare,
      },
      {
        label: "수강료 가성비",
        valA: acadA.scoreCostEfficiency,
        valB: acadB.scoreCostEfficiency,
      },
      {
        label: "셔틀·통학 편의성",
        valA: acadA.scoreDistance,
        valB: acadB.scoreDistance,
      },
      {
        label: "과제량 적정성",
        valA: acadA.scoreHomework,
        valB: acadB.scoreHomework,
      },
    ];
  }, [acadA, acadB]);

  // 6각 레이더 SVG 좌표 계산
  const cx = 150;
  const cy = 135;
  const maxR = 85;
  const getPoint = (idx: number, score: number) => {
    const angle = (Math.PI * 2 * idx) / 6 - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, score)) / 100) * maxR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  };

  return (
    <div className="space-y-6">
      {/* 상단 사교육비 총액 & 지역화폐/카드 할인 절감 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>남매 월 명목 사교육비 총합</span>
            <Wallet className="w-4 h-4 text-[#F24553]" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {budgetStats.totalGrossKr.toLocaleString()}원
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            첫째 {(budgetStats.firstChildKr / 10000).toFixed(1)}만 · 둘째{" "}
            {(budgetStats.secondChildKr / 10000).toFixed(1)}만
          </div>
        </div>

        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>지역화폐(10%) + 교육카드 청구할인</span>
            <CreditCard className="w-4 h-4 text-[#00d000]" />
          </div>
          <div className="text-2xl font-extrabold text-[#00d000]">
            -{budgetStats.totalSavedKr.toLocaleString()}원 절감
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            지역화폐 -{budgetStats.localCurrencySavedKr.toLocaleString()}원 포함
          </div>
        </div>

        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>할인·세액공제 반영 실체감 교육비</span>
            <Sparkles className="w-4 h-4 text-[#d5ff00]" />
          </div>
          <div className="text-2xl font-extrabold text-[#d5ff00]">
            {budgetStats.netActualFeeKr.toLocaleString()}원
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            실질 할인율{" "}
            {(
              (budgetStats.totalSavedKr /
                Math.max(1, budgetStats.totalGrossKr)) *
              100
            ).toFixed(1)}
            % 달성
          </div>
        </div>

        <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5 flex flex-col justify-between">
          <div className="text-xs text-zinc-400">
            지역화폐 인센티브율 ({localCurrencyDiscountPct}%) 설정
          </div>
          <input
            type="range"
            min={5}
            max={15}
            step={1}
            value={localCurrencyDiscountPct}
            onChange={(e) =>
              setLocalCurrencyDiscountPct(Number(e.target.value))
            }
            className="w-full accent-[#d5ff00] my-2"
          />
          <div className="text-[11px] text-zinc-400">
            동백전·경남사랑·포항사랑카드 학원 가맹점 10% 캐시백 반영
          </div>
        </div>
      </div>

      {/* 과목별 사교육비 비중 + 학원 6각 레이더 맞비교 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#17171C] border border-[#282832] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              📊 과목별 사교육비 지출 포트폴리오 비중
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              영어·예체능·수학·코딩·독서논술 투자 밸런스 진단
            </p>
            <div className="space-y-3.5">
              {budgetStats.categoryPieData.map((cat, idx) => {
                const barColor = COLORS[idx % COLORS.length];
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: barColor }}
                        />
                        {cat.name}
                      </span>
                      <span className="text-zinc-300 font-semibold">
                        {cat.value.toLocaleString()}원 ({cat.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#202027] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(4, cat.pct)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#282832] text-xs text-zinc-400 flex justify-between">
            <span>총 과목 카테고리: {budgetStats.categoryPieData.length}개</span>
            <span className="text-[#d5ff00] font-bold">
              합계 {budgetStats.totalGrossKr.toLocaleString()}원
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#17171C] border border-[#282832] rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#d5ff00]" />
                학원별 아이 만족도 · 성취도 · 가성비 6각 레이더 맞비교
              </h3>
              <p className="text-xs text-zinc-400">
                수강료 대비 아이의 흥미와 학습 효과가 높은 학원을 객관적으로 비교합니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <select
              aria-label="비교 학원 A 선택"
              value={compareIdA}
              onChange={(e) => setCompareIdA(Number(e.target.value))}
              className="bg-[#202027] border border-[#F24553]/60 rounded-xl px-3 py-2 text-xs text-white font-semibold"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  🔴 [{s.childName.split(" ")[0]}] {s.title} (
                  {(s.monthlyFee / 10000).toFixed(0)}만)
                </option>
              ))}
            </select>

            <select
              aria-label="비교 학원 B 선택"
              value={compareIdB}
              onChange={(e) => setCompareIdB(Number(e.target.value))}
              className="bg-[#202027] border border-[#d5ff00]/60 rounded-xl px-3 py-2 text-xs text-white font-semibold"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  🟡 [{s.childName.split(" ")[0]}] {s.title} (
                  {(s.monthlyFee / 10000).toFixed(0)}만)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="flex justify-center">
              <svg viewBox="0 0 300 270" className="w-full max-w-[280px] h-64">
                {[25, 50, 75, 100].map((lvl) => (
                  <polygon
                    key={lvl}
                    points={[0, 1, 2, 3, 4, 5]
                      .map((i) => getPoint(i, lvl))
                      .join(" ")}
                    fill="none"
                    stroke="#2E2E38"
                    strokeWidth="1"
                  />
                ))}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const [x, y] = getPoint(i, 100).split(",").map(Number);
                  const [lx, ly] = getPoint(i, 122).split(",").map(Number);
                  return (
                    <g key={i}>
                      <line
                        x1={cx}
                        y1={cy}
                        x2={x}
                        y2={y}
                        stroke="#2E2E38"
                        strokeWidth="1"
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#D4D4D8"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {radarAxes[i]?.label}
                      </text>
                    </g>
                  );
                })}
                {radarAxes.length === 6 && (
                  <>
                    <polygon
                      points={radarAxes
                        .map((ax, i) => getPoint(i, ax.valA))
                        .join(" ")}
                      fill="#F24553"
                      fillOpacity={0.35}
                      stroke="#F24553"
                      strokeWidth="2"
                    />
                    <polygon
                      points={radarAxes
                        .map((ax, i) => getPoint(i, ax.valB))
                        .join(" ")}
                      fill="#d5ff00"
                      fillOpacity={0.3}
                      stroke="#d5ff00"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>
            </div>

            <div className="space-y-2 text-xs">
              {radarAxes.map((ax) => (
                <div
                  key={ax.label}
                  className="bg-[#202027] rounded-xl p-2.5 flex items-center justify-between"
                >
                  <span className="text-zinc-300 font-semibold">{ax.label}</span>
                  <div className="flex items-center gap-3 font-bold">
                    <span className="text-[#F24553]">🔴 {ax.valA}점</span>
                    <span className="text-[#d5ff00]">🟡 {ax.valB}점</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 학원비 결제일(D-Day) & 결제수단 명세 테이블 */}
      <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-3">
          💳 매월 학원비 결제일 캘린더 & 최적 결제수단 명세
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#282832] text-zinc-400 text-xs">
                <th className="py-2.5 px-3">자녀</th>
                <th className="py-2.5 px-3">학원 / 과정명</th>
                <th className="py-2.5 px-3">과목</th>
                <th className="py-2.5 px-3 text-center">수업요일 / 시간</th>
                <th className="py-2.5 px-3 text-center">매월 결제일</th>
                <th className="py-2.5 px-3">결제수단</th>
                <th className="py-2.5 px-3 text-right">월 수강료</th>
                <th className="py-2.5 px-3 text-right">만족도 / 성취도</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23232C]">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-[#202027]/60">
                  <td className="py-2.5 px-3 text-xs font-semibold text-zinc-300">
                    {s.childName}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">{s.title}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#202027] text-xs text-zinc-300">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs text-zinc-300">
                    {s.daysOfWeek} ({s.startTime}~{s.endTime})
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#3182F6]/20 text-[#3182F6] text-xs font-bold">
                      매월 {s.billingDay}일
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-[#00d000] font-semibold">
                    {s.paymentMethod}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#d5ff00]">
                    {s.monthlyFee.toLocaleString()}원
                  </td>
                  <td className="py-2.5 px-3 text-right text-xs text-zinc-200">
                    흥미 {s.scoreSatisfaction}점 / 성취 {s.scoreAchievement}점
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
