"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import DutchPayView from "@/components/DutchPayView";
import { TripData } from "@/types";
import { getTrip } from "@/lib/storage";
import {
  KidsHubDatabase,
  loadKidsDb,
  createFamilyInDb,
} from "@/lib/kidsStorage";
import TimetableView from "@/components/kids/TimetableView";
import EduBudgetView from "@/components/kids/EduBudgetView";
import ReadingPortfolioView from "@/components/kids/ReadingPortfolioView";
import ChildManageView from "@/components/kids/ChildManageView";
import OutingCuratorView from "@/components/kids/OutingCuratorView";
import FamilyStampView from "@/components/kids/FamilyStampView";
import {
  Compass,
  Loader2,
  GraduationCap,
  FerrisWheel,
  Tent,
  Calendar,
  Wallet,
  BookOpen,
  Users,
  Award,
  Sun,
  Moon,
  Home,
  PlusCircle,
  CheckCircle2,
  X,
  RefreshCw,
  MessageCircle,
} from "lucide-react";

type GlobalMode = "TRAVEL_DUTCH" | "EDU_MODE" | "OUTING_MODE";
type KidsSubTab = 1 | 2 | 3 | 4 | 5 | 6;

export default function HomePage() {
  // 최상단 3대 메인 모드: [우정여행&더치페이] | [학원·간트차트 & 사교육비] | [부산·경남·경북 나들이]
  const [globalMode, setGlobalMode] = useState<GlobalMode>("TRAVEL_DUTCH");

  // 1) 기존 우정여행 & 더치페이 상태
  const [trip, setTrip] = useState<TripData | null>(null);
  const [activeTravelTab, setActiveTravelTab] = useState<
    "itinerary" | "settlement"
  >("itinerary");
  const [loading, setLoading] = useState(true);

  // 2) 모드3 & 모드5 (KidsLife & EduHub) 상태
  const [kidsDb, setKidsDb] = useState<KidsHubDatabase | null>(null);
  const [selectedFamilyKey, setSelectedFamilyKey] =
    useState<string>("park-juyeon"); // 디폴트: 박주연 가족
  const [showFamilyGateModal, setShowFamilyGateModal] =
    useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [kidsSubTab, setKidsSubTab] = useState<KidsSubTab>(1);

  // 새 가족 추가 폼 상태
  const [showAddFamilyForm, setShowAddFamilyForm] = useState<boolean>(false);
  const [newFamilyName, setNewFamilyName] = useState<string>("");
  const [newFamilyRegion, setNewFamilyRegion] = useState<string>("부산 해운대");
  const [newFirstChild, setNewFirstChild] = useState<string>("첫째 아이 (초1)");

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [showChatTip, setShowChatTip] = useState<boolean>(true);

  // Supabase 클라우드 DB 연동 fetchTrip (실패 시 local storage fallback)
  const fetchTrip = useCallback(async () => {
    try {
      const res = await fetch(`/api/trip?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: TripData = await res.json();
        setTrip(data);
      } else {
        console.warn("API fetch failed, falling back to local storage cache");
        setTrip(getTrip());
      }
    } catch (err) {
      console.warn("Network error, falling back to local storage cache:", err);
      setTrip(getTrip());
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshKidsDb = useCallback(async () => {
    try {
      const res = await fetch(`/api/kids?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && cloudData.families && cloudData.families.length > 0) {
          try {
            localStorage.setItem("travel_dutch_kids_hub_db_v3", JSON.stringify(cloudData));
          } catch {}
          setKidsDb(cloudData);
          return;
        } else {
          // Cloud DB is empty: seed it with current local database
          const localDb = loadKidsDb();
          await fetch("/api/kids", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(localDb),
          });
          setKidsDb(localDb);
          return;
        }
      }
    } catch (err) {
      console.warn("Kids cloud sync error:", err);
    }

    const localDb = loadKidsDb();
    setKidsDb({ ...localDb });
  }, []);

  const triggerManualSync = async () => {
    setIsSyncing(true);
    await Promise.all([fetchTrip(), refreshKidsDb()]);
    setTimeout(() => setIsSyncing(false), 500);
  };

  useEffect(() => {
    fetchTrip();
    refreshKidsDb();

    // 실시간 클라우드 DB 주기적 동기화 (모바일/PC 양방향 즉시 반영)
    const pollInterval = setInterval(() => {
      fetchTrip();
      refreshKidsDb();
    }, 4000);

    const onFocus = () => {
      fetchTrip();
      refreshKidsDb();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    try {
      const savedFam = localStorage.getItem("kidslife_selected_family");
      const savedTheme = localStorage.getItem("kidslife_theme_mode") as
        | "dark"
        | "light"
        | null;
      if (savedFam) setSelectedFamilyKey(savedFam);
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeMode(savedTheme);
      }
    } catch {}

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchTrip, refreshKidsDb]);

  useEffect(() => {
    try {
      localStorage.setItem("kidslife_selected_family", selectedFamilyKey);
    } catch {}
  }, [selectedFamilyKey]);

  useEffect(() => {
    try {
      localStorage.setItem("kidslife_theme_mode", themeMode);
    } catch {}
  }, [themeMode]);

  const switchGlobalMode = (mode: GlobalMode) => {
    setGlobalMode(mode);
    if (mode === "EDU_MODE") {
      setKidsSubTab(1);
    } else if (mode === "OUTING_MODE") {
      setKidsSubTab(5);
    }
  };

  const families = useMemo(() => kidsDb?.families || [], [kidsDb]);

  const currentFamily = useMemo(
    () =>
      families.find((f) => f.familyKey === selectedFamilyKey) || {
        id: 1,
        familyKey: "park-juyeon",
        familyName: "주연 가족",
        regionTag: "승현(10세) · 다윤(6세)",
        motto: "승현(10세)·다윤(6세) 남매의 즐거운 배움과 주말 부울경 가족 탐험!",
        avatar: "🌸",
        accentColor: "#EC4899",
      },
    [families, selectedFamilyKey]
  );

  const childrenList = useMemo(
    () =>
      (kidsDb?.children || []).filter(
        (c) => c.familyKey === selectedFamilyKey
      ),
    [kidsDb, selectedFamilyKey]
  );

  const schedules = useMemo(
    () =>
      (kidsDb?.schedules || [])
        .filter((s) => s.familyKey === selectedFamilyKey)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [kidsDb, selectedFamilyKey]
  );

  const readings = useMemo(
    () =>
      (kidsDb?.readings || []).filter(
        (r) => r.familyKey === selectedFamilyKey
      ),
    [kidsDb, selectedFamilyKey]
  );

  const spots = useMemo(() => kidsDb?.spots || [], [kidsDb]);

  const stamps = useMemo(
    () =>
      (kidsDb?.stamps || []).filter((s) => s.familyKey === selectedFamilyKey),
    [kidsDb, selectedFamilyKey]
  );

  const totalMonthlyFeeKr = useMemo(
    () => schedules.reduce((acc, cur) => acc + cur.monthlyFee, 0),
    [schedules]
  );

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    const created = createFamilyInDb({
      familyName: newFamilyName.trim(),
      regionTag: newFamilyRegion,
      firstChildName: newFirstChild,
    });
    setNewFamilyName("");
    setShowAddFamilyForm(false);
    refreshKidsDb();
    setSelectedFamilyKey(created.familyKey);
    setShowFamilyGateModal(false);
  };

  if (loading || !trip || !kidsDb) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-4 animate-bounce">
          <Compass className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-bold text-base">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>통합 라이프 & 여행 플랫폼을 불러오는 중...</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Supabase 클라우드 데이터베이스와 일정을 동기화하고 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* =========================================================
          최상단 글로벌 통합 스위처 바:
          [우정여행&더치페이] | [학원·간트차트 & 사교육비] | [부산·경남·경북 나들이]
          ========================================================= */}
      <div className="bg-white/95 text-slate-800 border-b border-slate-100 sticky top-0 z-40 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* 채널톡 스타일: 상단 3대 메인 모드 버튼 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => switchGlobalMode("TRAVEL_DUTCH")}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition ${
                globalMode === "TRAVEL_DUTCH"
                  ? "bg-[#1D68FE] text-white shadow-md shadow-blue-500/25"
                  : "bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Tent className="w-4 h-4" />
              <span>우정여행&더치페이</span>
            </button>

            <button
              onClick={() => switchGlobalMode("EDU_MODE")}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition ${
                globalMode === "EDU_MODE"
                  ? "bg-[#1D68FE] text-white shadow-md shadow-blue-500/25"
                  : "bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>학원·간트차트 & 사교육비</span>
            </button>

            <button
              onClick={() => switchGlobalMode("OUTING_MODE")}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition ${
                globalMode === "OUTING_MODE"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                  : "bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FerrisWheel className="w-4 h-4" />
              <span>부산·경남·경북 나들이</span>
            </button>
          </div>

          {/* 우측 컨트롤: 가족 선택 & 실시간 동기화 버튼 */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-1.5">
              <Home className="w-3.5 h-3.5 text-[#1D68FE]" />
              <select
                aria-label="가족 선택"
                value={selectedFamilyKey}
                onChange={(e) => setSelectedFamilyKey(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
              >
                {families.map((fam) => (
                  <option
                    key={fam.familyKey}
                    value={fam.familyKey}
                    className="bg-white text-slate-900"
                  >
                    {fam.avatar} {fam.familyName}
                    {fam.familyKey === "park-juyeon" ? " (기본)" : ""}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFamilyGateModal(true)}
                className="ml-1 px-2.5 py-0.5 rounded-xl bg-blue-50 text-[#1D68FE] text-[11px] font-extrabold hover:bg-blue-100 transition"
              >
                가족선택
              </button>
            </div>

            {/* 실시간 클라우드 DB 동기화 버튼 (채널톡 말풍선 스타일) */}
            <button
              onClick={triggerManualSync}
              title="Supabase 실시간 클라우드 DB 즉시 동기화"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition font-black text-xs shadow-2xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-emerald-600 ${
                  isSyncing ? "animate-spin" : ""
                }`}
              />
              <span>실시간 동기화</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          가족 프로필 선택 모달 (디폴트: 박주연 가족)
          ========================================================= */}
      {showFamilyGateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#17171C] border-2 border-[#3182F6] rounded-3xl w-full max-w-3xl p-5 sm:p-8 shadow-2xl my-auto text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-[#d5ff00]/20 text-[#d5ff00] text-xs font-extrabold">
                  MULTI-FAMILY HUB · 가족별 독립 워크스페이스
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                  👨‍👩‍👧‍👦 사용할 가족 프로필을 선택해 주세요
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  디폴트(기본)로 <strong>‘박주연 가족’</strong>이 설정되어 있습니다.
                </p>
              </div>
              <button
                onClick={() => setShowFamilyGateModal(false)}
                className="p-2 rounded-xl bg-[#202027] text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {families.map((fam) => {
                const isSelected = fam.familyKey === selectedFamilyKey;
                const isDefaultPark = fam.familyKey === "park-juyeon";
                return (
                  <div
                    key={fam.familyKey}
                    onClick={() => {
                      setSelectedFamilyKey(fam.familyKey);
                      setShowFamilyGateModal(false);
                    }}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#202027] border-[#d5ff00] shadow-lg"
                        : "bg-[#202027]/60 border-[#282832] hover:border-zinc-500"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{fam.avatar}</span>
                        {isDefaultPark && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#3182F6] text-white text-[11px] font-extrabold">
                            ★ DEFAULT 기본
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-white">
                        {fam.familyName}
                      </h3>
                      <div className="text-xs text-[#d5ff00] font-semibold mt-0.5">
                        📍 {fam.regionTag}
                      </div>
                      <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                        {fam.motto}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-700/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            isSelected ? "text-[#00d000]" : "text-zinc-500"
                          }`}
                        />
                        {isSelected ? "현재 선택됨" : "터치하여 전환"}
                      </span>
                      <span className="text-[#3182F6] font-extrabold">
                        입장 →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {showAddFamilyForm && (
              <form
                onSubmit={handleCreateFamily}
                className="bg-[#202027] border border-zinc-700 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end"
              >
                <div>
                  <label className="block text-zinc-400 mb-1">새 가족 이름</label>
                  <input
                    type="text"
                    required
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="최지훈 가족"
                    className="w-full bg-[#17171C] border border-zinc-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">거주 지역</label>
                  <input
                    type="text"
                    value={newFamilyRegion}
                    onChange={(e) => setNewFamilyRegion(e.target.value)}
                    placeholder="부산 해운대"
                    className="w-full bg-[#17171C] border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">
                    첫째 자녀 이름
                  </label>
                  <input
                    type="text"
                    value={newFirstChild}
                    onChange={(e) => setNewFirstChild(e.target.value)}
                    placeholder="첫째 지안 (초2)"
                    className="w-full bg-[#17171C] border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#00d000] text-black font-extrabold"
                  >
                    생성
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFamilyForm(false)}
                    className="py-2 px-3 rounded-xl bg-zinc-800 text-zinc-300"
                  >
                    취소
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setShowAddFamilyForm((p) => !p)}
                className="px-4 py-2.5 rounded-xl bg-[#202027] hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-700"
              >
                <PlusCircle className="w-4 h-4 text-[#d5ff00]" />+ 새로운 가족 추가
              </button>
              <button
                onClick={() => setShowFamilyGateModal(false)}
                className="px-6 py-3 rounded-xl bg-[#3182F6] hover:bg-blue-600 text-white text-sm font-extrabold shadow-lg transition"
              >
                👨‍👩‍👧‍👦 ‘{currentFamily.familyName}’으로 계속하기 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          모드별 화면 렌더링
          1) TRAVEL_DUTCH: [우정여행&더치페이]
          2) EDU_MODE: [학원·간트차트 & 사교육비]
          3) OUTING_MODE: [부산·경남·경북 나들이]
          ========================================================= */}
      {globalMode === "TRAVEL_DUTCH" ? (
        <div className="flex-1 flex flex-col bg-white text-slate-800">
          

          {/* 채널톡 스타일: SaaS 신뢰 장치 & 고객사 로고 줄 */}
          <div className="bg-gradient-to-b from-blue-50/60 via-white to-white py-5 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-[#1D68FE] text-xs font-black mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1D68FE] animate-pulse"></span>
                    <span>국산 스마트 여행 SaaS 정석</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    누가 얼마 보낼지 고민 끝. 여행 계획과 영수증 정산을 하나로.
                  </h2>
                </div>
                
                {/* 신뢰 장치: 협력 모임 로고 줄 */}
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 opacity-80 flex-wrap justify-center">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
                    🏕️ 캠핑클럽 코리아
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
                    🎓 대학연합 MT 네트워크
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
                    🌴 제주도 워크숍 크루
                  </span>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1 pb-12">
            {activeTravelTab === "itinerary" ? (
              <MapView trip={trip} onRefresh={fetchTrip} />
            ) : (
              <DutchPayView trip={trip} onRefresh={fetchTrip} />
            )}
          </main>
        </div>
      ) : (
        <div
          className={`flex-1 flex flex-col bg-[#101013] text-zinc-100 transition-colors duration-200 ${
            themeMode === "light" ? "theme-light" : "theme-dark"
          }`}
        >
          {/* 서브 메뉴 네비게이션 바 */}
          <div className="bg-[#17171C] border-b border-[#282832] px-4 lg:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              {globalMode === "EDU_MODE" ? (
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    {
                      id: 1 as KidsSubTab,
                      label: "🗓️ 시간표 · 간트차트 & 수정/삭제",
                      icon: <Calendar className="w-4 h-4" />,
                    },
                    {
                      id: 2 as KidsSubTab,
                      label: "💳 사교육비 예산 & 6각 레이더",
                      icon: <Wallet className="w-4 h-4" />,
                    },
                    {
                      id: 3 as KidsSubTab,
                      label: "📚 독서록 & 교외체험학습 보고서",
                      icon: <BookOpen className="w-4 h-4" />,
                    },
                    {
                      id: 4 as KidsSubTab,
                      label: `👨‍👩‍👧‍👦 남매 · 자녀 프로필 설정 (${childrenList.length}명)`,
                      icon: <Users className="w-4 h-4" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setKidsSubTab(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition border ${
                        kidsSubTab === tab.id
                          ? "bg-[#3182F6] border-[#3182F6] text-white shadow"
                          : "bg-[#202027] border-zinc-700 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    {
                      id: 5 as KidsSubTab,
                      label: "🌤️ 부산·경남·경북 날씨·180분 랜덤 나들이 큐레이터",
                      icon: <Compass className="w-4 h-4" />,
                    },
                    {
                      id: 6 as KidsSubTab,
                      label: `📸 가족 추억 지도 & 스탬프 투어 (${stamps.length}회)`,
                      icon: <Award className="w-4 h-4" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setKidsSubTab(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition border ${
                        kidsSubTab === tab.id
                          ? "bg-[#d5ff00] border-[#d5ff00] text-black shadow"
                          : "bg-[#202027] border-zinc-700 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-[#202027] border border-zinc-700 font-bold text-zinc-300">
                  {currentFamily.avatar} {currentFamily.familyName} · 월 사교육비{" "}
                  <strong className="text-[#F24553]">
                    {totalMonthlyFeeKr.toLocaleString()}원
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
            {kidsSubTab === 1 && (
              <TimetableView
                familyKey={selectedFamilyKey}
                schedules={schedules}
                childrenList={childrenList}
                onRefresh={refreshKidsDb}
              />
            )}
            {kidsSubTab === 2 && <EduBudgetView schedules={schedules} />}
            {kidsSubTab === 3 && (
              <ReadingPortfolioView
                familyKey={selectedFamilyKey}
                childrenList={childrenList}
                readings={readings}
                onReadingAdded={refreshKidsDb}
              />
            )}
            {kidsSubTab === 4 && (
              <ChildManageView
                familyKey={selectedFamilyKey}
                childrenList={childrenList}
                onRefresh={refreshKidsDb}
              />
            )}
            {kidsSubTab === 5 && <OutingCuratorView spots={spots} />}
            {kidsSubTab === 6 && (
              <FamilyStampView
                familyKey={selectedFamilyKey}
                stamps={stamps}
                onStampAdded={refreshKidsDb}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
