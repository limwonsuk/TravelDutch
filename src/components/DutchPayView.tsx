'use client';

import React, { useState, useMemo } from 'react';
import { TripData } from '@/types';
import { calculateSettlement } from '@/lib/settlement';
import { addExpense, deleteExpense } from '@/lib/storage';
import {
  Wallet,
  PieChart,
  ArrowRight,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  Check,
  Receipt,
  Users,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface DutchPayViewProps {
  trip: TripData;
  onRefresh: () => void;
}

// 채널톡 스타일 소프트 파스텔 카테고리 컬러
const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  식비: { bg: 'bg-amber-50 border border-amber-200/80', text: 'text-amber-800', bar: 'bg-amber-400' },
  숙박: { bg: 'bg-purple-50 border border-purple-200/80', text: 'text-purple-800', bar: 'bg-purple-500' },
  교통: { bg: 'bg-emerald-50 border border-emerald-200/80', text: 'text-emerald-800', bar: 'bg-emerald-500' },
  입장료: { bg: 'bg-sky-50 border border-sky-200/80', text: 'text-sky-800', bar: 'bg-sky-400' },
  기타: { bg: 'bg-blue-50 border border-blue-200/80', text: 'text-blue-800', bar: 'bg-[#1D68FE]' },
};

export default function DutchPayView({ trip, onRefresh }: DutchPayViewProps) {
  // New Expense Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('식비');
  const [payerId, setPayerId] = useState(trip.members[0]?.id || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    trip.members.map((m) => m.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Run Settlement Calculation (Minimum Cash Flow Greedy)
  const settlement = useMemo(() => {
    return calculateSettlement(trip.members, trip.expenses);
  }, [trip.members, trip.expenses]);

  // Handle Select All / Deselect All Members
  const toggleSelectAll = () => {
    if (selectedMemberIds.length === trip.members.length) {
      setSelectedMemberIds([payerId || trip.members[0]?.id]);
    } else {
      setSelectedMemberIds(trip.members.map((m) => m.id));
    }
  };

  const toggleMemberSelection = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) {
        alert('최소 1명 이상의 참여 인원을 선택해야 합니다.');
        return;
      }
      setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  // Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;
    if (selectedMemberIds.length === 0) {
      alert('정산에 참여할 멤버를 1명 이상 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          title: title.trim(),
          amount: numAmount,
          category,
          payerId: payerId || trip.members[0]?.id,
          splitMemberIds: selectedMemberIds,
        }),
      });

      if (!res.ok) {
        addExpense(
          title.trim(),
          numAmount,
          category,
          payerId || trip.members[0]?.id,
          selectedMemberIds
        );
      }

      setTitle('');
      setAmount('');
      onRefresh();
    } catch (err) {
      console.error(err);
      addExpense(
        title.trim(),
        numAmount,
        category,
        payerId || trip.members[0]?.id,
        selectedMemberIds
      );
      setTitle('');
      setAmount('');
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (expenseId: string, expenseTitle: string) => {
    if (!confirm(`'${expenseTitle}' 지출 내역을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        deleteExpense(expenseId);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
      deleteExpense(expenseId);
      onRefresh();
    }
  };

  // Copy Settlement Summary for KakaoTalk / Messenger
  const handleCopySummary = () => {
    const textLines = [
      `✈️ [${trip.title}] 스마트 정산 알림`,
      `📅 기간: ${trip.startDate} ~ ${trip.endDate}`,
      `💰 총 지출: ${settlement.totalExpense.toLocaleString()}원 (1인당 약 ${settlement.averagePerMember.toLocaleString()}원)`,
      '',
      '📌 [개인별 정산 현황]',
      ...settlement.memberBalances.map((mb) => {
        const sign = mb.netBalance > 0 ? `+${mb.netBalance.toLocaleString()}원 수령` : mb.netBalance < 0 ? `${Math.abs(mb.netBalance).toLocaleString()}원 송금 필요` : '정산 완료';
        return `• ${mb.name}: 지불 ${mb.totalPaid.toLocaleString()}원 / 부담 ${mb.totalShare.toLocaleString()}원 (${sign})`;
      }),
      '',
      '🎯 [최소 송금 안내 (가장 간편한 방법)]',
      ...(settlement.transactions.length > 0
        ? settlement.transactions.map(
            (tx, idx) => `${idx + 1}. ${tx.fromName} ➔ ${tx.toName} : ${tx.amount.toLocaleString()}원`
          )
        : ['모든 정산이 완료되었습니다! 🎉']),
      '',
      '💬 우정여행&더치페이에서 자동 계산되었습니다.'
    ];

    navigator.clipboard.writeText(textLines.join('\n')).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    });
  };

  // Calculate preview split per person
  const previewPerPerson =
    amount && !isNaN(parseInt(amount, 10)) && selectedMemberIds.length > 0
      ? Math.round(parseInt(amount, 10) / selectedMemberIds.length)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 채널톡 스타일: 옅은 파스텔 상단 안내 배너 */}
      <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700">
          <span className="w-7 h-7 rounded-full bg-[#1D68FE] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            💬
          </span>
          <span className="font-extrabold text-slate-900">
            총 {trip.expenses.length}건의 지출 내역이 등록되었습니다.
          </span>
          <span className="hidden md:inline text-slate-500">
            수학적 최소 송금 알고리즘으로 단 {settlement.transactions.length}번의 계좌 이체만 하면 전원 정산이 끝납니다.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white text-[#1D68FE] font-black border border-blue-200/80 shadow-2xs">
            ⚡ 실시간 자동 정산 가동 중
          </span>
        </div>
      </div>

      {/* 1. 요약 카드 섹션 (채널톡 스타일: 둥근 라운드 3xl, 선명한 블루, 소프트 파스텔) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 총 지출액 카드 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1D68FE] flex-shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-0.5">총 누적 지출액</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {settlement.totalExpense.toLocaleString()}
              <span className="text-sm font-semibold text-slate-500 ml-1">원</span>
            </h3>
          </div>
        </div>

        {/* 1인당 평균 부담액 카드 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-0.5">
              1인당 평균 부담 ({trip.members.length}명)
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {settlement.averagePerMember.toLocaleString()}
              <span className="text-sm font-semibold text-slate-500 ml-1">원</span>
            </h3>
          </div>
        </div>

        {/* 메신저 공유 버튼 카드 (채널톡 비비드 블루 그라데이션) */}
        <div className="bg-gradient-to-br from-[#1D68FE] to-[#1355DF] rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-extrabold text-blue-100">원클릭 결과 공유</span>
            </div>
            <Receipt className="w-5 h-5 text-blue-200" />
          </div>
          <div className="mt-4">
            <button
              onClick={handleCopySummary}
              className="w-full py-3 px-4 bg-white text-[#1D68FE] hover:bg-blue-50 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
            >
              {copiedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-black">카카오톡 정산문구 복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>카톡 단톡방 공유 텍스트 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 카테고리별 지출 비율 프로그레스 바 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1D68FE] flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">카테고리별 지출 분포</h4>
          </div>
          <span className="text-xs font-bold text-slate-400">자동 실시간 합산</span>
        </div>

        {settlement.totalExpense === 0 ? (
          <p className="text-xs text-slate-400 py-2">등록된 지출 내역이 없습니다.</p>
        ) : (
          <div>
            {/* 가로 프로그레스 바 */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {Object.entries(settlement.categoryTotals).map(([cat, total]) => {
                const percent = Math.round((total / settlement.totalExpense) * 100);
                if (percent === 0) return null;
                const catStyle = CATEGORY_COLORS[cat] || CATEGORY_COLORS['기타'];
                return (
                  <div
                    key={cat}
                    style={{ width: `${percent}%` }}
                    className={`${catStyle.bar} h-full transition-all`}
                    title={`${cat}: ${total.toLocaleString()}원 (${percent}%)`}
                  />
                );
              })}
            </div>

            {/* 범례 리스트 */}
            <div className="flex flex-wrap gap-4 mt-4 pt-2">
              {Object.entries(settlement.categoryTotals).map(([cat, total]) => {
                const percent = Math.round((total / settlement.totalExpense) * 100);
                const catStyle = CATEGORY_COLORS[cat] || CATEGORY_COLORS['기타'];
                return (
                  <div key={cat} className="flex items-center gap-1.5 text-xs">
                    <span className={`w-3 h-3 rounded-full ${catStyle.bar}`} />
                    <span className="font-extrabold text-slate-700">{cat}</span>
                    <span className="text-slate-500 font-medium">
                      {total.toLocaleString()}원 ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. 최소 송금 정산표 (말풍선 모티프 UI) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1D68FE] text-xs font-black border border-blue-200/80">
                스마트 알고리즘
              </span>
              <h3 className="text-xl font-black text-slate-900">
                최소 송금 안내 (Minimum Cash Flow)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 keep-all">
              친구들끼리 여러 번 주고받을 필요 없이, 가장 적은 횟수로 모든 빚이 청산되도록 계산해 드립니다.
            </p>
          </div>
          <span className="text-xs font-black text-[#1D68FE] bg-blue-50 px-3.5 py-2 rounded-2xl border border-blue-200/80 self-start md:self-auto">
            단 {settlement.transactions.length}번 송금으로 완결
          </span>
        </div>

        {/* 말풍선 송금 카드 목록 */}
        <div className="mt-6">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-4">
            누가 ➔ 누구에게 얼마를 보낼까요?
          </label>

          {settlement.transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-extrabold text-slate-800">모든 정산이 완벽하게 끝났습니다!</p>
              <p className="text-xs text-slate-400 mt-1">서로 주고받을 차액이 남아있지 않습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settlement.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/50 to-white hover:border-[#1D68FE] hover:shadow-md transition-all flex items-center justify-between gap-3 speech-bubble"
                >
                  {/* 보내는 사람 */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base shadow-xs flex-shrink-0"
                      style={{ backgroundColor: tx.fromAvatarColor }}
                    >
                      {tx.fromAvatarEmoji}
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold text-rose-500 block">보내는 분</span>
                      <span className="font-black text-slate-900 text-sm">{tx.fromName}</span>
                    </div>
                  </div>

                  {/* 송금 금액 및 화살표 */}
                  <div className="flex flex-col items-center flex-shrink-0 px-2">
                    <span className="text-sm font-black text-[#1D68FE]">
                      {tx.amount.toLocaleString()}원
                    </span>
                    <div className="flex items-center text-[#1D68FE] my-0.5">
                      <div className="w-6 h-0.5 bg-[#1D68FE]"></div>
                      <ArrowRight className="w-4 h-4 -ml-1" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">송금</span>
                  </div>

                  {/* 받는 사람 */}
                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <span className="text-[11px] font-extrabold text-emerald-600 block">받는 분</span>
                      <span className="font-black text-slate-900 text-sm">{tx.toName}</span>
                    </div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base shadow-xs flex-shrink-0"
                      style={{ backgroundColor: tx.toAvatarColor }}
                    >
                      {tx.toAvatarEmoji}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 개인별 순잔액 현황 */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-3">
            참여자별 지출 vs 부담 내역
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {settlement.memberBalances.map((mb) => {
              const isCreditor = mb.netBalance > 0;
              const isDebtor = mb.netBalance < 0;

              return (
                <div
                  key={mb.memberId}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-xs"
                        style={{ backgroundColor: mb.avatarColor }}
                      >
                        {mb.avatarEmoji}
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm">{mb.name}</span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-black flex items-center gap-0.5 ${
                        isCreditor
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDebtor
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isCreditor && <TrendingUp className="w-3 h-3" />}
                      {isDebtor && <TrendingDown className="w-3 h-3" />}
                      {isCreditor
                        ? `+${mb.netBalance.toLocaleString()}원 수령`
                        : isDebtor
                        ? `${mb.netBalance.toLocaleString()}원 송금`
                        : '정산 완료'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mt-2 border-t border-slate-200/60 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">결제한 금액:</span>
                      <span className="font-bold">{mb.totalPaid.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">부담할 금액:</span>
                      <span className="font-bold">{mb.totalShare.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 새 지출 내역 등록 폼 & 지출 내역 목록 (2단 그리드) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 새 지출 등록 폼 (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1D68FE] flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-base">새 지출 등록</h3>
          </div>

          <form onSubmit={handleAddExpense} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                지출 항목명 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 해변열차 티켓, 회식비"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1D68FE] focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  결제 금액 (KRW) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="예: 44000"
                  step="10"
                  min="10"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1D68FE] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1D68FE] focus:bg-white cursor-pointer"
                >
                  <option value="식비">식비</option>
                  <option value="숙박">숙박</option>
                  <option value="교통">교통</option>
                  <option value="입장료">입장료</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            {/* 결제한 사람 선택 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                누가 결제했나요? (결제자) *
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1D68FE] focus:bg-white cursor-pointer"
              >
                {trip.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatarEmoji} {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 정산 참여 인원 선택 체크박스 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  함께 분담할 인원 ({selectedMemberIds.length}/{trip.members.length}명)
                </label>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-extrabold text-[#1D68FE] hover:underline"
                >
                  {selectedMemberIds.length === trip.members.length ? '전체 해제' : '전원 선택'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {trip.members.map((member) => {
                  const isChecked = selectedMemberIds.includes(member.id);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => toggleMemberSelection(member.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all ${
                        isChecked
                          ? 'border-[#1D68FE] bg-blue-50 font-extrabold text-blue-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{member.avatarEmoji}</span>
                      <span className="text-xs flex-1 truncate font-bold">{member.name}</span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#1D68FE]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {previewPerPerson > 0 && (
                <div className="mt-3 text-xs text-blue-800 bg-blue-50 px-3.5 py-2 rounded-2xl flex items-center justify-between border border-blue-200/60">
                  <span className="font-medium">1인당 예상 분담액:</span>
                  <span className="font-black text-sm">{previewPerPerson.toLocaleString()}원</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !amount}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#1D68FE] hover:bg-blue-600 text-white font-black text-sm disabled:opacity-50 transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>지출 내역 등록하기</span>
            </button>
          </form>
        </div>

        {/* 우측: 등록된 지출 내역 목록 (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1D68FE] flex items-center justify-center font-bold">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-base">
                등록된 지출 내역 ({trip.expenses.length}건)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">최신순 정렬</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1 max-h-[520px]">
            {trip.expenses.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-sm font-bold">지출 내역이 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">좌측 폼에서 첫 지출을 등록해 보세요.</p>
              </div>
            ) : (
              trip.expenses.map((expense) => {
                const catStyle = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS['기타'];

                return (
                  <div
                    key={expense.id}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white transition-all shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* 결제자 아바타 */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-xs flex-shrink-0"
                        style={{ backgroundColor: expense.payer.avatarColor }}
                        title={`결제자: ${expense.payer.name}`}
                      >
                        {expense.payer.avatarEmoji}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${catStyle.bg} ${catStyle.text}`}
                          >
                            {expense.category}
                          </span>
                          <h4 className="font-black text-slate-900 text-sm">{expense.title}</h4>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-bold text-slate-700">
                            결제: {expense.payer.name}
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">
                            참여: {expense.splits.map((s) => s.member?.name).join(', ')} ({expense.splits.length}명)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block">
                          {expense.amount.toLocaleString()}원
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          인당 {Math.round(expense.amount / expense.splits.length).toLocaleString()}원
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense.id, expense.title)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="내역 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
