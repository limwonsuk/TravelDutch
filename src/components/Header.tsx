'use client';

import React, { useState } from 'react';
import { TripData, Member } from '@/types';
import { addMember, deleteMember } from '@/lib/storage';
import { Calendar, Users, Wallet, Plus, Trash2, X, Compass, DollarSign, Check } from 'lucide-react';

interface HeaderProps {
  trip: TripData;
  activeTab: 'itinerary' | 'settlement';
  setActiveTab: (tab: 'itinerary' | 'settlement') => void;
  onRefresh: () => void;
}

const EMOJI_OPTIONS = ['🏄', '🌸', '📷', '🍕', '🚀', '🎸', '☕', '🌟', '🎧', '✈️'];
const COLOR_OPTIONS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#64748B'];

export default function Header({ trip, activeTab, setActiveTab, onRefresh }: HeaderProps) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalExpense = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  // 동적 박/일 계산
  const durationLabel = React.useMemo(() => {
    try {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return `${diffDays}박 ${diffDays + 1}일`;
      }
    } catch (e) {}
    return '3박 4일';
  }, [trip.startDate, trip.endDate]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsSubmitting(true);
    try {
      addMember(newMemberName.trim(), selectedColor, selectedEmoji);
      setNewMemberName('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (trip.members.length <= 1) {
      alert('최소 1명의 동행자가 있어야 합니다.');
      return;
    }
    if (!confirm(`'${memberName}' 동행자를 삭제하시겠습니까?\n해당 인원의 결제 및 분담 내역도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      deleteMember(memberId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* 여행 타이틀 & 기간 */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">{trip.title}</h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {durationLabel}
                  </span>
                </div>
                <div className="flex items-center text-xs text-slate-500 mt-0.5 space-x-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {trip.startDate} ~ {trip.endDate}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-medium">부산 광역시</span>
                </div>
              </div>
            </div>

            {/* 동행자 아바타 & 총 지출 요약 & 액션 버튼 */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* 동행자 아바타 목록 버튼 */}
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all text-xs font-medium text-slate-700 border border-slate-200"
                title="동행자 관리 (추가/삭제)"
              >
                <div className="flex -space-x-2 overflow-hidden items-center py-0.5">
                  {trip.members.map((m) => (
                    <div
                      key={m.id}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: m.avatarColor }}
                      title={`${m.name}`}
                    >
                      <span>{m.avatarEmoji}</span>
                    </div>
                  ))}
                </div>
                <span className="ml-1 font-semibold text-slate-800">{trip.members.length}명</span>
                <span className="text-slate-400 group-hover:text-slate-600 transition-colors">⚙️ 관리</span>
              </button>

              {/* 총 지출액 배지 */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>총 지출:</span>
                <span className="text-emerald-700 text-sm">{totalExpense.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 메인 탭 전환 네비게이션 */}
          <div className="flex space-x-1 mt-3 border-t border-slate-100 pt-2.5">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>일정 & 동선 맵 뷰</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'itinerary' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {trip.itineraryItems.length}곳
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settlement')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'settlement'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>경비 내역 & 더치페이 정산 뷰</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'settlement' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {trip.expenses.length}건
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 동행자 관리 모달 */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">동행자 관리</h2>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 현재 동행자 목록 */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                현재 등록된 동행자 ({trip.members.length}명)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {trip.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        <span>{member.avatarEmoji}</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{member.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="동행자 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 새 동행자 추가 폼 */}
            <form onSubmit={handleAddMember} className="mt-5 pt-4 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                새 동행자 추가
              </label>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="이름 (예: 태호)"
                    maxLength={10}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 이모지 선택 */}
                <div>
                  <span className="text-xs text-slate-500 block mb-1">대표 이모지</span>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border transition-transform ${
                          selectedEmoji === emoji
                            ? 'border-indigo-600 bg-indigo-50 scale-110 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 컬러 선택 */}
                <div>
                  <span className="text-xs text-slate-500 block mb-1">배경 색상</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          selectedColor === color ? 'border-slate-900 scale-110 shadow-xs' : 'border-white'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !newMemberName.trim()}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>동행자 등록</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
