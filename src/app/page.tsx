'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import DutchPayView from '@/components/DutchPayView';
import { TripData } from '@/types';
import { getTrip } from '@/lib/storage';
import { Compass, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [trip, setTrip] = useState<TripData | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'settlement'>('itinerary');
  const [loading, setLoading] = useState(true);

  const refreshTrip = useCallback(() => {
    const data = getTrip();
    setTrip({ ...data });
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  if (loading || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-4 animate-bounce">
          <Compass className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-bold text-base">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>부산 여행 플래너를 불러오는 중...</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">일정 동선 및 더치페이 정산 데이터를 구성하고 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 헤더 네비게이션 */}
      <Header
        trip={trip}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={refreshTrip}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 pb-12">
        {activeTab === 'itinerary' ? (
          <MapView trip={trip} onRefresh={refreshTrip} />
        ) : (
          <DutchPayView trip={trip} onRefresh={refreshTrip} />
        )}
      </main>
    </div>
  );
}
