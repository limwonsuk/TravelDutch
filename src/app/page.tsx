'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import DutchPayView from '@/components/DutchPayView';
import { TripData } from '@/types';
import { Compass, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [trip, setTrip] = useState<TripData | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'settlement'>('itinerary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrip = useCallback(async () => {
    try {
      const res = await fetch('/api/trip');
      if (!res.ok) {
        throw new Error('Failed to load trip data');
      }
      const data: TripData = await res.json();
      setTrip(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  if (loading) {
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

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="p-4 rounded-full bg-rose-50 text-rose-500 mb-3">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">데이터를 불러올 수 없습니다</h2>
        <p className="text-xs text-slate-500 mb-4">{error || '여행 데이터를 찾을 수 없습니다.'}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchTrip();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
        >
          다시 시도하기
        </button>
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
        onRefresh={fetchTrip}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 pb-12">
        {activeTab === 'itinerary' ? (
          <MapView trip={trip} onRefresh={fetchTrip} />
        ) : (
          <DutchPayView trip={trip} onRefresh={fetchTrip} />
        )}
      </main>
    </div>
  );
}
