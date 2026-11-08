'use client';

import React, { useState } from 'react';
import { TripData, Member } from '@/types';
import { addMember, deleteMember } from '@/lib/storage';
import { Calendar, Users, Wallet, Plus, Trash2, X, Compass, DollarSign, Check, MapPin } from 'lucide-react';

interface HeaderProps {
  trip: TripData;
  activeTab: 'itinerary' | 'settlement';
  setActiveTab: (tab: 'itinerary' | 'settlement') => void;
  onRefresh: () => void;
}

const EMOJI_OPTIONS = ['🌸', '🌟', '🚀', '🏄', '📷', '🍕', '🎸', '☕', '🎧', '✈️'];
const COLOR_OPTIONS = ['#1D68FE', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#64748B'];

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
    return '1박 2일';
  }, [trip.startDate, trip.endDate]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          name: newMemberName.trim(),
          avatarEmoji: selectedEmoji,
          avatarColor: selectedColor,
        }),
      });

      if (!res.ok) {
        // Fallback to local storage
        addMember(newMemberName.trim(), selectedColor, selectedEmoji);
      }
      setNewMemberName('');
      onRefresh();
    } catch (err) {
      console.error(err);
      addMember(newMemberName.trim(), selectedColor, selectedEmoji);
      setNewMemberName('');
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (trip.members.length <= 1) {
      alert('최소 1명의 동행자가 있어야 합니다.');
      return;
    }
    if (!confirm(`'${memberName}' 동행자를 삭제하시겠습니까?\n해당 인원의 결제 및 분담 내역도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        deleteMember(memberId);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
      deleteMember(memberId);
      onRefresh();
    }
  };

  return (
    <>
      {/* 채널톡 스타일: 화이트 배경, 깔끔한 보더, 친근한 말풍선 모티프 헤더 */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* 좌측: 타이틀 & 여행 정보 */}
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#1D68FE] flex items-center justify-center text-white shadow-md shadow-blue-500/25 flex-shrink-0">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {trip.title}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-[#1D68FE] border border-blue-200/80">
                    {durationLabel}
                  </span>
                </div>
                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {trip.startDate} ~ {trip.endDate}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#1D68FE] font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    안면도 & 태안
                  </span>
                </div>
              </div>
            </div>

            {/* 우측: 동행자 아바타 & 총 지출 배지 */}
            <div className="flex items-center flex-wrap gap-3">
              {/* 동행자 관리 버튼 (말풍선 모티프) */}
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all text-xs font-bold text-slate-700 border border-slate-200/90 shadow-2xs"
                title="동행자 관리 (추가/삭제)"
              >
                <div className="flex -space-x-2 overflow-hidden items-center py-0.5">
                  {trip.members.map((m) => (
                    <div
                      key={m.id}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-white text-xs font-bold shadow-xs"
                      style={{ backgroundColor: m.avatarColor }}
                      title={`${m.name}`}
                    >
                      <span>{m.avatarEmoji}</span>
                    </div>
                  ))}
                </div>
                <span className="font-extrabold text-slate-900">{trip.members.length}명 참여 중</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-[11px] group-hover:bg-blue-100 transition">설정</span>
              </button>

              {/* 총 지출액 배지 (파스텔 민트) */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-extrabold shadow-2xs">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>총 지출:</span>
                <span className="text-emerald-700 text-sm font-black">{totalExpense.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 메인 탭 전환 네비게이션 (채널톡 스타일 짧은 한국어 & 비비드 블루) */}
          <div className="flex space-x-2 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-[#1D68FE] text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>여행 일정</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'itinerary' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {trip.itineraryItems.length}곳
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settlement')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'settlement'
                  ? 'bg-[#1D68FE] text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/60'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>더치페이 정산</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'settlement' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {trip.expenses.length}건
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 동행자 관리 모달 (둥근 모서리 2xl + 비비드 블루 포인트) */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D68FE] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900">동행자 관리</h2>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 현재 동행자 목록 */}
            <div className="mt-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                현재 등록된 동행자 ({trip.members.length}명)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {trip.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        <span>{member.avatarEmoji}</span>
                      </div>
                      <span className="font-extrabold text-slate-800 text-sm">{member.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                새 동행자 추가
              </label>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="친구 이름 입력 (예: 태호)"
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1D68FE] focus:bg-white"
                    required
                  />
                </div>

                {/* 이모지 선택 */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">대표 이모지</span>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base border transition-transform ${
                          selectedEmoji === emoji
                            ? 'border-[#1D68FE] bg-blue-50 scale-110 shadow-xs'
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
                  <span className="text-xs font-semibold text-slate-500 block mb-1">배경 색상</span>
                  <div className="flex flex-wrap gap-2">
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
                  className="w-full mt-3 py-3 px-4 rounded-2xl bg-[#1D68FE] hover:bg-blue-600 text-white font-extrabold text-sm disabled:opacity-50 transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>동행자 등록하기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
