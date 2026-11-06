'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TripData, ItineraryItem, BUSAN_PRESETS } from '@/types';
import { addItineraryItem, deleteItineraryItem, reorderItineraryItem } from '@/lib/storage';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  MapPin,
  Sparkles,
  X,
  Navigation,
  DollarSign,
  Info,
} from 'lucide-react';

// Dynamically import LeafletMap with SSR disabled as strictly required by architecture rules!
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 animate-pulse">
      <MapPin className="w-10 h-10 mb-2 text-indigo-400 animate-bounce" />
      <span className="font-semibold text-sm">부산 인터랙티브 지도를 불러오는 중...</span>
    </div>
  ),
});

// Dynamically import LocationPickerMap with SSR disabled
const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs animate-pulse">
      <MapPin className="w-4 h-4 mr-1 text-slate-400 animate-bounce" />
      위치 선택 지도 불러오는 중...
    </div>
  ),
});

interface MapViewProps {
  trip: TripData;
  onRefresh: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  관광: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  식당: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  숙소: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  카페: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  교통: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  기타: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export default function MapView({ trip, onRefresh }: MapViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [modalDay, setModalDay] = useState<number>(1);
  const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Itinerary Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('관광');
  const [time, setTime] = useState('11:00');
  const [memo, setMemo] = useState('');
  const [lat, setLat] = useState('35.1587');
  const [lng, setLng] = useState('129.1604');
  const [estimatedCost, setEstimatedCost] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate dynamic days based on trip dates and items
  const totalDays = useMemo(() => {
    const maxItemDay = trip.itineraryItems.reduce((max, item) => Math.max(max, item.dayNumber), 1);
    try {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const dateDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const count = Math.max(maxItemDay, isNaN(dateDays) ? 4 : dateDays, 4);
      return Array.from({ length: count }, (_, i) => i + 1);
    } catch {
      const count = Math.max(maxItemDay, 4);
      return Array.from({ length: count }, (_, i) => i + 1);
    }
  }, [trip]);

  // Filter items for selected day
  const currentDayItems = useMemo(() => {
    return trip.itineraryItems
      .filter((item) => item.dayNumber === selectedDay)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [trip.itineraryItems, selectedDay]);

  // Handle Preset Selection
  const applyPreset = (preset: typeof BUSAN_PRESETS[0]) => {
    setTitle(preset.name);
    setCategory(preset.category);
    setLat(preset.lat.toString());
    setLng(preset.lng.toString());
    if (preset.memo) {
      setMemo(preset.memo);
    }
  };

  // Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      addItineraryItem({
        tripId: trip.id,
        dayNumber: modalDay,
        title: title.trim(),
        category,
        time,
        memo: memo.trim(),
        lat: parseFloat(lat) || 35.1587,
        lng: parseFloat(lng) || 129.1604,
        estimatedCost: parseInt(estimatedCost) || 0,
      });

      setIsAddModalOpen(false);
      setTitle('');
      setMemo('');
      setEstimatedCost('0');
      setSelectedDay(modalDay);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Item
  const handleDeleteItem = (itemId: string, itemTitle: string) => {
    if (!confirm(`'${itemTitle}' 일정을 삭제하시겠습니까?`)) return;

    try {
      deleteItineraryItem(itemId);
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Reorder Item
  const handleReorder = (itemId: string, direction: 'up' | 'down') => {
    try {
      reorderItineraryItem(itemId, direction);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 2단 분할 반응형 그리드: 좌측 타임라인 / 우측 지도 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 좌측 패널: Day 탭 & 타임라인 카드 목록 (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col min-h-[640px]">
          {/* Day 1 ~ Day N 탭 전환 헤더 */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
              {totalDays.map((day) => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedItem(null);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    selectedDay === day
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Day {day}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setModalDay(selectedDay);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs shadow-indigo-100 transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>일정 추가</span>
            </button>
          </div>

          {/* 일차 정보 및 방문 장소 수 요약 */}
          <div className="flex items-center justify-between text-xs text-slate-500 py-3">
            <span className="font-semibold text-slate-700">
              Day {selectedDay} 여행 코스 ({currentDayItems.length}곳 방문)
            </span>
            <span>지도의 마커 및 동선과 실시간 연동</span>
          </div>

          {/* 타임라인 카드 리스트 */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[530px]">
            {currentDayItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Navigation className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-sm font-medium">등록된 일정이 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">
                  [일정 추가] 버튼을 눌러 부산 명소를 등록해 보세요!
                </p>
              </div>
            ) : (
              currentDayItems.map((item, index) => {
                const isSelected = selectedItem?.id === item.id;
                const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['기타'];

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {/* 방문 순서 배지 */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {item.orderIndex}
                        </div>

                        {/* 내용 */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                            >
                              {item.category}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {item.time}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{item.title}</h4>
                          {item.memo && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.memo}</p>
                          )}
                          {item.estimatedCost > 0 && (
                            <span className="inline-block text-[11px] font-semibold text-emerald-600 mt-1">
                              예상 {item.estimatedCost.toLocaleString()}원
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 순서 이동 & 삭제 컨트롤 */}
                      <div
                        className="flex items-center space-x-0.5 opacity-90 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleReorder(item.id, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
                          title="위로 이동"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(item.id, 'down')}
                          disabled={index === currentDayItems.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
                          title="아래로 이동"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id, item.title)}
                          className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                          title="일정 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 우측 패널: 인터랙티브 지도 (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-3 h-[640px] flex flex-col">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Day {selectedDay} 동선 및 인터랙티브 지도
              </h3>
            </div>
            <span className="text-xs text-slate-400">카드를 누르면 지도 위치로 자동 이동(flyTo)</span>
          </div>

          <div className="flex-1 w-full h-full overflow-hidden rounded-xl border border-slate-100">
            <LeafletMap
              items={currentDayItems}
              selectedItem={selectedItem}
              onSelectItem={(item) => setSelectedItem(item)}
            />
          </div>
        </div>
      </div>

      {/* 새 일정 추가 모달 (부산 주요 명소 빠른 좌표 프리셋 포함) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Day {modalDay} 새 일정 추가
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 부산 주요 명소 빠른 좌표 프리셋 선택 버튼 영역 */}
            <div className="mt-4 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <label className="text-xs font-bold text-indigo-900 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                부산 대표 명소 빠른 좌표 프리셋 (클릭 시 자동 입력)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BUSAN_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all font-medium shadow-xs"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 추가 폼 */}
            <form onSubmit={handleAddItem} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    방문 일차 *
                  </label>
                  <select
                    value={modalDay}
                    onChange={(e) => setModalDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {totalDays.map((d) => (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    장소명 / 일정 제목 *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 해운대 해수욕장"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    카테고리
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="관광">관광</option>
                    <option value="식당">식당</option>
                    <option value="숙소">숙소</option>
                    <option value="카페">카페</option>
                    <option value="교통">교통</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    방문 시간
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 지도에서 위치 직접 선택 (위도/경도 자동 세팅) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    지도에서 위치 직접 선택 (클릭 시 자동 세팅)
                  </label>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    지도를 클릭하세요 📍
                  </span>
                </div>
                
                <LocationPickerMap
                  lat={parseFloat(lat) || 35.1587}
                  lng={parseFloat(lng) || 129.1604}
                  onChange={(newLat, newLng) => {
                    setLat(newLat.toString());
                    setLng(newLng.toString());
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    위도 (Latitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-slate-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    경도 (Longitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  예상 비용 (KRW)
                </label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  메모 / 세부 계획
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="포토존, 추천 메뉴, 주차 정보 등"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Day {selectedDay}에 일정 등록</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
