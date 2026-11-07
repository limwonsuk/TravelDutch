"use client";

import React, { useEffect, useMemo, useState } from "react";
import { OutingSpotItem } from "@/lib/kidsTypes";
import { buildFullRandomSpotPool } from "@/lib/randomSpotEngine";
import {
  CloudRain,
  Sun,
  Snowflake,
  Car,
  Compass,
  CheckSquare,
  CalendarClock,
  Star,
  Shuffle,
  ExternalLink,
  Globe,
  BookOpenText,
  Sparkles,
} from "lucide-react";

interface OutingCuratorViewProps {
  spots: OutingSpotItem[];
}

const PAGE_SIZE = 6;

const WEATHER_LABELS: Record<string, string> = {
  ALL: "🌈 날씨 전체 (실내·야외 통합 랜덤 추천)",
  RAIN: "☔ 비·미세먼지 나쁨 맞춤 (실내 과학관·아쿠아리움·박물관 랜덤 추천)",
  SUNNY: "☀️ 화창하고 맑은 날 맞춤 (숲·루지·테마파크·바다·케이블카 랜덤 추천)",
  EXTREME: "❄️ 폭염·한파 주의보 맞춤 (실내 워터파크·온실·직업체험·터널 랜덤 추천)",
};

export default function OutingCuratorView({ spots }: OutingCuratorViewProps) {
  const [weatherPreset, setWeatherPreset] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [ageFilter, setAgeFilter] = useState<string>("ALL");
  // 차량 이동시간 기본값 180분 이내 (20분 ~ 180분 설정 가능)
  const [maxDriveMinutes, setMaxDriveMinutes] = useState<number>(180);
  // 랜덤 시드 & 드로우 카운트 (클릭 시마다 완전히 새로운 랜덤 조합 추출)
  const [randomSeed, setRandomSeed] = useState<number>(20261107);
  const [drawCount, setDrawCount] = useState<number>(1);
  const [showAllAtOnce, setShowAllAtOnce] = useState<boolean>(false);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // 클라이언트 마운트 시 최초 랜덤 시드 부여 (접속할 때마다 새로운 랜덤 추천)
  useEffect(() => {
    setRandomSeed(Date.now() + Math.floor(Math.random() * 100000));
  }, []);

  // 정적 24곳이 아닌 부산·경남·경북 전역 80+곳 랜덤 셔플 풀 생성
  const fullShuffledPool = useMemo(() => {
    const generated = buildFullRandomSpotPool(randomSeed);
    // DB/ 기본 spots에 추가로 들어온 커스텀 장소가 있으면 이름 중복 제거 후 병합
    const existingNames = new Set(generated.map((g) => g.name));
    const extras = (spots || []).filter((s) => !existingNames.has(s.name));
    return [...generated, ...extras];
  }, [randomSeed, spots]);

  // 날씨 · 권역 · 연령 · 차량 이동시간(최대 180분)에 따른 필터링 + 랜덤 정렬
  const filteredPool = useMemo(() => {
    return fullShuffledPool.filter((sp) => {
      if (weatherPreset === "RAIN" && sp.indoorOutdoor === "OUTDOOR") {
        return false;
      }
      if (weatherPreset === "SUNNY" && sp.indoorOutdoor === "INDOOR") {
        return false;
      }
      if (
        weatherPreset === "EXTREME" &&
        sp.bestWeather !== "폭염·한파실내" &&
        sp.indoorOutdoor !== "INDOOR"
      ) {
        return false;
      }
      if (regionFilter !== "ALL" && sp.region !== regionFilter) return false;
      if (
        ageFilter !== "ALL" &&
        sp.ageGroup !== "전연령" &&
        sp.ageGroup !== ageFilter
      ) {
        return false;
      }
      if (sp.driveMinutes > maxDriveMinutes) return false;
      return true;
    });
  }, [
    fullShuffledPool,
    weatherPreset,
    regionFilter,
    ageFilter,
    maxDriveMinutes,
  ]);

  // 현재 화면에 보여줄 랜덤 추천 6곳 (또는 전체 보기)
  const recommendedSpots = useMemo(() => {
    if (filteredPool.length === 0) return [];
    if (showAllAtOnce || filteredPool.length <= PAGE_SIZE) return filteredPool;
    return filteredPool.slice(0, PAGE_SIZE);
  }, [filteredPool, showAllAtOnce]);

  const activeSpot = useMemo(() => {
    if (selectedSpotId !== null) {
      const found = filteredPool.find((s) => s.id === selectedSpotId);
      if (found) return found;
    }
    return recommendedSpots[0] || filteredPool[0];
  }, [selectedSpotId, recommendedSpots, filteredPool]);

  // 🎲 완전히 새로운 랜덤 시드로 다시 섞기
  const triggerRandomDraw = (nextWeather?: string, nextRegion?: string) => {
    if (nextWeather !== undefined) setWeatherPreset(nextWeather);
    if (nextRegion !== undefined) setRegionFilter(nextRegion);
    setShowAllAtOnce(false);
    const newSeed = Date.now() + Math.floor(Math.random() * 999999);
    setRandomSeed(newSeed);
    setDrawCount((c) => c + 1);
    setSelectedSpotId(null);
  };

  const packingList = useMemo(() => {
    if (!activeSpot) return [];
    const custom = activeSpot.packingTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return [
      ...custom,
      "어린이 상비약(해열제·밴드)",
      "물티슈·손소독제",
      "아이 여벌 양말/겉옷",
    ];
  }, [activeSpot]);

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="space-y-6">
      {/* 상단: 부산·경남·경북 권역 + 날씨별 랜덤 큐레이션 + 차량 180분 슬라이더 */}
      <div className="bg-[#17171C] border border-[#282832] rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d5ff00]/20 text-[#d5ff00] text-[11px] font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                DYNAMIC RANDOM CURATOR · 부울경·경북 80+ 명소 실시간 랜덤 엔진
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#d5ff00]" />
              부산 · 경남 · 경북 주말 ‘아이와 어디 가지?’ 날씨·거리별 랜덤 큐레이터
            </h2>
            <p className="text-xs text-zinc-400">
              고정된 24곳이 아니라 <strong>부산·경남·경북 전역(차량 20분~180분 이내) 80여 곳 명소 풀</strong>에서 날씨와 권역에 맞춰 매번 <strong>랜덤하게 새로운 장소</strong>를 뽑아줍니다!
            </p>
          </div>

          {/* 🎲 다른 장소 랜덤 추천받기 (핵심 버튼) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerRandomDraw()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F24553] to-[#9f2cf5] hover:brightness-110 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg transition active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              🎲 다른 장소 랜덤 뽑기 ({drawCount}회차 셔플)
            </button>
            <button
              onClick={() => setShowAllAtOnce((prev) => !prev)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition ${
                showAllAtOnce
                  ? "bg-[#d5ff00] border-[#d5ff00] text-black"
                  : "bg-[#202027] border-zinc-700 text-zinc-300 hover:text-white"
              }`}
            >
              {showAllAtOnce
                ? "6곳씩 랜덤 추천 모드로"
                : `조건 부합 전체 ${filteredPool.length}곳 보기`}
            </button>
          </div>
        </div>

        {/* 1단계: 부산 / 경남 / 경북 권역 원클릭 버튼 (클릭 시 즉시 랜덤 셔플) */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-[#282832]">
          <span className="text-xs font-bold text-[#d5ff00] mr-1">
            📍 권역별 랜덤 뽑기:
          </span>
          {[
            { id: "ALL", label: "🎲 전체 권역 랜덤 (부산·경남·경북)" },
            {
              id: "부산",
              label: "🌊 부산 랜덤 (기장·해운대·영도·강서·사하·금정 등)",
            },
            {
              id: "경남",
              label: "🦖 경남 랜덤 (창원·김해·거제·통영·고성·밀양·진주·사천·남해·하동 등)",
            },
            {
              id: "경북",
              label: "🏛️ 경북 랜덤 (경주·포항·청도·구미·문경·안동·영덕·울진·상주 등)",
            },
          ].map((reg) => (
            <button
              key={reg.id}
              onClick={() => triggerRandomDraw( undefined, reg.id )}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                regionFilter === reg.id
                  ? "bg-[#d5ff00] text-black shadow"
                  : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* 2단계: 날씨 시나리오 원클릭 프리셋 (클릭할 때마다 해당 날씨 맞춤 명소를 새로 랜덤 추첨!) */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-bold text-zinc-300 mr-1">
            🌤️ 날씨별 랜덤 추천 (클릭 시 새로 추첨):
          </span>
          <button
            onClick={() => triggerRandomDraw("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              weatherPreset === "ALL"
                ? "bg-white text-black shadow"
                : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            🌈 날씨 전체 랜덤
          </button>
          <button
            onClick={() => triggerRandomDraw("RAIN")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              weatherPreset === "RAIN"
                ? "bg-[#3182F6] text-white shadow"
                : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />☔ 비·미세먼지 나쁨 (실내 명소 랜덤 뽑기)
          </button>
          <button
            onClick={() => triggerRandomDraw("SUNNY")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              weatherPreset === "SUNNY"
                ? "bg-[#00d000] text-black shadow"
                : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />☀️ 화창한 날 (야외 숲·루지·테마파크 랜덤 뽑기)
          </button>
          <button
            onClick={() => triggerRandomDraw("EXTREME")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              weatherPreset === "EXTREME"
                ? "bg-[#9f2cf5] text-white shadow"
                : "bg-[#202027] text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />❄️ 폭염·한파 (워터파크·온실·실내테마 랜덤 뽑기)
          </button>
        </div>

        {/* 3단계: 세부 필터 바 (차량 이동시간 최대 180분까지 설정 가능!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#202027] p-3.5 rounded-xl text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">
              권역 드롭다운 (부산 · 경남 · 경북)
            </label>
            <select
              aria-label="권역 필터"
              value={regionFilter}
              onChange={(e) => triggerRandomDraw(undefined, e.target.value)}
              className="w-full bg-[#17171C] border border-zinc-700 rounded-lg px-3 py-2 text-white font-semibold"
            >
              <option value="ALL">전체 권역 랜덤 (부산 · 경남 · 경북)</option>
              <option value="부산">부산 (기장·해운대·센텀·영도·강서·사하·금정)</option>
              <option value="경남">
                경남 (창원·김해·양산·거제·통영·고성·밀양·진주·사천·남해·하동·합천)
              </option>
              <option value="경북">
                경북 (경주·포항·청도·구미·영천·문경·안동·영덕·울진·상주·칠곡)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">아이 연령대 추천</label>
            <select
              aria-label="아이 연령대 추천"
              value={ageFilter}
              onChange={(e) => {
                setAgeFilter(e.target.value);
                triggerRandomDraw();
              }}
              className="w-full bg-[#17171C] border border-zinc-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="ALL">전 연령 (영유아 ~ 초등 전체)</option>
              <option value="영유아(3~7세)">영유아 집중 (3~7세)</option>
              <option value="초등저학년(8~10세)">초등 저학년 (8~10세)</option>
              <option value="초등고학년(11~13세)">초등 고학년 (11~13세)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span>최대 차량 이동시간 (편도 20~180분)</span>
              <span className="text-[#d5ff00] font-extrabold">
                🚗 {maxDriveMinutes}분 이내 ({filteredPool.length}곳 부합)
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={180}
              step={10}
              value={maxDriveMinutes}
              onChange={(e) => setMaxDriveMinutes(Number(e.target.value))}
              className="w-full accent-[#d5ff00] mt-1"
            />
            <div className="flex justify-between gap-1 mt-1.5">
              {[60, 90, 120, 150, 180].map((minVal) => (
                <button
                  key={minVal}
                  type="button"
                  onClick={() => setMaxDriveMinutes(minVal)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                    maxDriveMinutes === minVal
                      ? "bg-[#3182F6] text-white"
                      : "bg-[#17171C] text-zinc-400 hover:text-white"
                  }`}
                >
                  {minVal}분내
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 현재 랜덤 추천 코스 상태 배너 */}
        <div className="mt-3 px-4 py-2.5 rounded-xl bg-[#202027] border border-[#3182F6]/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-bold text-[#d5ff00]">
            🎲 [{drawCount}회차 랜덤 추출] {WEATHER_LABELS[weatherPreset]} · 차량{" "}
            {maxDriveMinutes}분 이내 (후보 {filteredPool.length}곳 중{" "}
            {recommendedSpots.length}곳 랜덤 표시)
          </div>
          <span className="text-zinc-400">
            같은 날씨 버튼을 한 번 더 누르거나 <strong>[🎲 다른 장소 랜덤 뽑기]</strong>를 누르면 즉시 다른 명소가 랜덤 추천됩니다!
          </span>
        </div>
      </div>

      {/* 본문: 좌측 나들이 명소 그리드 (8 cols) + 우측 선택 명소 예약 꿀팁 & 준비물 체크리스트 (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedSpots.map((spot) => {
            const isSelected = activeSpot?.id === spot.id;
            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpotId(spot.id)}
                className={`cursor-pointer bg-[#17171C] rounded-2xl p-4 border transition flex flex-col justify-between ${
                  isSelected
                    ? "border-[#d5ff00] shadow-lg bg-[#202027]/70"
                    : "border-[#282832] hover:border-zinc-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#d5ff00]/20 text-[#d5ff00] font-extrabold">
                        {spot.region}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          spot.indoorOutdoor === "INDOOR"
                            ? "bg-[#3182F6]/20 text-[#3182F6]"
                            : spot.indoorOutdoor === "OUTDOOR"
                            ? "bg-[#00d000]/20 text-[#00d000]"
                            : "bg-[#9f2cf5]/20 text-[#9f2cf5]"
                        }`}
                      >
                        {spot.indoorOutdoor === "INDOOR"
                          ? "🏠 실내"
                          : spot.indoorOutdoor === "OUTDOOR"
                          ? "🌳 야외"
                          : "🏛️ 실내외 복합"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#202027] text-zinc-300 text-[10px]">
                        {spot.bestWeather}
                      </span>
                    </div>
                    <span className="text-zinc-400">
                      {spot.subRegion} · {spot.category}
                    </span>
                  </div>

                  {/* 장소명 클릭 시 네이버 블로그 후기 또는 공식 홈페이지 바로 이동 링크 */}
                  <a
                    href={spot.blogSearchUrl || spot.homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="group inline-flex items-center gap-1.5 text-sm font-extrabold text-white hover:text-[#d5ff00] transition mb-1"
                  >
                    <span>{spot.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#d5ff00] shrink-0" />
                  </a>

                  <div className="text-xs text-zinc-200 bg-[#202027] p-2.5 rounded-xl my-2 leading-relaxed">
                    💡 <strong className="text-[#d5ff00]">예약·주차 꿀팁:</strong>{" "}
                    {spot.reservationTip}
                  </div>
                </div>

                <div>
                  <div className="pt-2 border-t border-[#282832] flex items-center justify-between text-xs mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-300 flex items-center gap-1 font-semibold">
                        <Car className="w-3.5 h-3.5 text-[#3182F6]" />
                        차량 {spot.driveMinutes}분
                      </span>
                      <span className="text-[#F24553] font-bold">
                        예상 {(spot.estimatedCostKr / 10000).toFixed(1)}만 원
                      </span>
                    </div>
                    <span className="text-[#d5ff00] font-bold flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      아이반응 {spot.kidReactionScore}
                    </span>
                  </div>

                  {/* 공식 홈페이지 & 네이버 블로그 후기 바로가기 버튼 2종 */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={spot.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-1.5 px-2.5 rounded-lg bg-[#202027] hover:bg-[#3182F6] text-zinc-200 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 border border-zinc-700 transition"
                    >
                      <Globe className="w-3 h-3" />
                      공식 홈페이지 ↗
                    </a>
                    <a
                      href={spot.blogSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-1.5 px-2.5 rounded-lg bg-[#00d000]/15 hover:bg-[#00d000] text-[#00d000] hover:text-black text-[11px] font-bold flex items-center justify-center gap-1 border border-[#00d000]/40 transition"
                    >
                      <BookOpenText className="w-3 h-3" />
                      네이버 블로그 후기 ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 우측: 선택된 나들이 장소 상세 브리핑 + 홈페이지/블로그 이동 + 준비물 체크리스트 */}
        <div className="lg:col-span-4 space-y-4">
          {activeSpot && (
            <div className="bg-[#17171C] border border-[#d5ff00]/60 rounded-2xl p-5 sticky top-6">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#d5ff00] font-bold">
                  📌 [{activeSpot.region} / {activeSpot.subRegion}] 나들이 브리핑
                </span>
                <button
                  onClick={() => triggerRandomDraw()}
                  className="text-[11px] text-[#F24553] hover:underline font-bold flex items-center gap-1"
                >
                  <Shuffle className="w-3 h-3" /> 다른 곳 랜덤 뽑기
                </button>
              </div>
              <h3 className="text-base font-extrabold text-white mb-3">
                {activeSpot.name}
              </h3>

              {/* 우측 패널 내 공식 홈페이지 & 블로그 후기 대형 버튼 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <a
                  href={activeSpot.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#3182F6] hover:bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  홈페이지·예약 이동
                </a>
                <a
                  href={activeSpot.blogSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#00d000] hover:bg-green-500 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow transition"
                >
                  <BookOpenText className="w-3.5 h-3.5" />
                  블로그 후기 보기
                </a>
              </div>

              <div className="bg-[#202027] rounded-xl p-3.5 mb-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">차량 예상 이동시간</span>
                  <span className="text-[#3182F6] font-extrabold">
                    편도 약 {activeSpot.driveMinutes}분
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">추천 연령대</span>
                  <span className="text-white font-semibold">
                    {activeSpot.ageGroup}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">최적 날씨 조건</span>
                  <span className="text-[#00d000] font-bold">
                    {activeSpot.bestWeather}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">가족 예상 총비용</span>
                  <span className="text-[#F24553] font-bold">
                    약 {activeSpot.estimatedCostKr.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">주차 쾌적도 평점</span>
                  <span className="text-[#d5ff00] font-bold">
                    ★ {activeSpot.parkingScore} / 5.0
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-[#9f2cf5]" />
                  사전예약 티켓팅 & 동선 핵심 가이드
                </h4>
                <p className="text-xs text-zinc-300 bg-[#202027] p-3 rounded-xl leading-relaxed">
                  {activeSpot.reservationTip}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#00d000]" />
                  출발 전 가방 챙기기 원클릭 체크리스트
                </h4>
                <div className="space-y-2">
                  {packingList.map((item) => {
                    const checked = Boolean(checkedItems[item]);
                    return (
                      <label
                        key={item}
                        onClick={() => toggleCheck(item)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs transition ${
                          checked
                            ? "bg-[#00d000]/15 text-[#d5ff00] line-through"
                            : "bg-[#202027] text-zinc-200 hover:bg-zinc-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="accent-[#d5ff00]"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
