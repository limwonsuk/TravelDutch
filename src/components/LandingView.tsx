"use client";

import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  Check,
  Copy,
  Receipt,
  Users,
  Wallet,
  Sparkles,
  MapPin,
  MessageCircle,
  X,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface LandingViewProps {
  onStartApp: () => void;
}

export default function LandingView({ onStartApp }: LandingViewProps) {
  // 미니 체험 계산기 상태
  const [calcAmount, setCalcAmount] = useState<number>(360000);
  const [calcMembers, setCalcMembers] = useState<number>(3);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // 플로팅 챗봇 상태
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [showChatTip, setShowChatTip] = useState<boolean>(true);
  const [chatAnswer, setChatAnswer] = useState<string>("");

  const perPerson = Math.round(calcAmount / (calcMembers || 1));

  const handleCopyMockResult = () => {
    const text = `[우정여행&더치페이 정산 알림]\n총 지출: ${calcAmount.toLocaleString()}원 (${calcMembers}명)\n1인당 부담액: ${perPerson.toLocaleString()}원\n스마트 정산 완료! 확인 부탁드려요 🚀`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    });
  };

  const handleReplyChat = (type: string) => {
    if (type.includes("무료")) {
      setChatAnswer(
        "네, 맞습니다! 가입 없이 0원으로 모든 여행 일정 등록과 1/N 정산, 카톡 영수증 공유 기능을 제한 없이 평생 무료로 이용하실 수 있습니다 😊"
      );
    } else if (type.includes("알고리즘")) {
      setChatAnswer(
        "탐욕 알고리즘(Minimum Cash Flow)을 사용하여, 그룹원 간의 차액을 상계 처리한 뒤 가장 적은 횟수로 모든 빚이 청산되도록 최적의 송금 경로를 자동 산출합니다 📊"
      );
    } else {
      setChatAnswer(
        "아니요, 앱 설치가 필요 없습니다! 웹 링크(URL)만 단체 카톡방에 공유하면 친구들도 폰 브라우저에서 바로 열람하고 함께 기록할 수 있어요 📱"
      );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ================= GNB 상단 헤더 ================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={onStartApp}>
              <div className="w-10 h-10 rounded-2xl bg-[#1D68FE] flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1">
                  우정여행<span className="text-[#1D68FE]">&</span>더치페이
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  SMART TRAVEL & PAY SAAS
                </span>
              </div>
            </div>

            {/* 짧은 한국어 메뉴 */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-slate-600">
              <a href="#features" className="hover:text-[#1D68FE] transition">
                기능 소개
              </a>
              <a href="#calculator" className="hover:text-[#1D68FE] transition">
                체험 계산기
              </a>
              <a href="#reviews" className="hover:text-[#1D68FE] transition">
                도입 후기
              </a>
              <a href="#security" className="hover:text-[#1D68FE] transition">
                실시간 동기화
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onStartApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1D68FE] hover:bg-blue-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition duration-200"
            >
              <span>플래너 앱 바로 열기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= 1. 히어로 섹션 ================= */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-[#F4F8FF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* 말풍선 뱃지 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#1D68FE] text-xs sm:text-sm font-black mb-6 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-[#1D68FE] animate-ping"></span>
            <span>여행 플래너와 1/N 정산이 만난 국산 SaaS</span>
          </div>

          {/* 큰 약속 한 줄 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight sm:leading-tight mb-6 max-w-4xl mx-auto tracking-tight" style={{ wordBreak: 'keep-all' }}>
            누가 얼마 보낼지 고민 끝.<br />
            <span className="text-[#1D68FE] underline decoration-blue-200 decoration-wavy underline-offset-8">
              여행 계획과 영수증 정산
            </span>
            을 하나로.
          </h1>

          {/* 다정한 존댓말 보조 설명 */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium" style={{ wordBreak: 'keep-all' }}>
            숙소, 바비큐 장보기, 고속도로 통행료까지 — 폰 하나로 함께 기록하면 최소 송금 횟수 알고리즘이 서로 얼굴 붉힐 일 없는 깔끔한 정산을 만들어 드립니다.
          </p>

          {/* CTA 버튼 영역 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onStartApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#1D68FE] hover:bg-blue-600 text-white text-base sm:text-lg font-black shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition duration-200"
            >
              <span>0원으로 우리 여행 만들기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-base font-bold shadow-2xs transition"
            >
              <span>10초 만에 계산 체험하기</span>
            </a>
          </div>

          {/* 히어로 실제 사용 화면 목업 카드 (말풍선 모티프) */}
          <div className="relative max-w-5xl mx-auto">
            {/* 좌측 상단 말풍선 플로팅 칩 */}
            <div className="hidden sm:flex absolute -top-6 -left-6 z-20 items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-blue-100 text-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div className="text-left text-xs">
                <p className="font-black text-slate-900">용덕 님이 256,460원 결제</p>
                <p className="text-slate-400">안면도 갯벌 체험비 · 3명 1/N 자동 분할</p>
              </div>
            </div>

            {/* 우측 상단 말풍선 플로팅 칩 */}
            <div className="hidden sm:flex absolute -top-8 -right-6 z-20 items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-blue-100 text-slate-800">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                💬
              </div>
              <div className="text-left text-xs">
                <p className="font-black text-slate-900">“정산 카톡 3초 만에 끝났어요!”</p>
                <p className="text-slate-400">송금 계좌와 차액까지 한 번에 복사</p>
              </div>
            </div>

            {/* 메인 목업 프레임 */}
            <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-200/80 ring-8 ring-slate-100/60">
              <div className="rounded-2xl bg-slate-900 p-4 sm:p-6 text-white text-left overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="ml-2 font-mono text-slate-400">travel-dutch.vercel.app</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Supabase 실시간 클라우드 연결됨
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-6">
                  {/* 컬럼 1 */}
                  <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-blue-300 font-bold">DAY 1 일정 동선</span>
                        <span className="text-[11px] bg-[#1D68FE] px-2 py-0.5 rounded text-white font-bold">
                          태안 캠핑
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">
                        안면도 갯벌 해루질 체험 & 오토 캠핑
                      </h3>
                      <p className="text-xs text-slate-400">인원 3명 (주연 🌸 · 혜림 🌟 · 용덕 🚀)</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-slate-400">등록 장소 3곳</span>
                      <span className="text-emerald-400 font-bold">지도 연동 완료 →</span>
                    </div>
                  </div>

                  {/* 컬럼 2 */}
                  <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-bold">실시간 총 지출액</span>
                        <span className="text-xs text-[#1D68FE] font-bold">총 7건 등록</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">
                        1,051,320<span className="text-base font-normal text-slate-300"> 원</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                          식비 25.6만
                        </span>
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">
                          체험 25.6만
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                          마트 26.1만
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                      <span>1인당 평균 부담금</span>
                      <span className="text-white font-black">350,440원</span>
                    </div>
                  </div>

                  {/* 컬럼 3 */}
                  <div className="bg-gradient-to-br from-blue-950/80 to-slate-800/90 rounded-2xl p-4 border border-blue-500/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-300">💡 최소 송금 결과</span>
                        <span className="text-[11px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black">
                          2번 송금으로 완결
                        </span>
                      </div>
                      <div className="space-y-2 mt-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
                          <span className="font-bold text-pink-400">주연 ➔ 용덕</span>
                          <span className="font-mono font-black text-white">318,440원</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
                          <span className="font-bold text-sky-400">혜림 ➔ 용덕</span>
                          <span className="font-mono font-black text-white">120,840원</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-[11px] text-blue-200 text-center font-bold">
                      카카오페이 / 토스 링크 바로 복사 가능
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. 고객사 로고 월 / 신뢰 장치 ================= */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">
            이미 2,400개 이상의 동호회·학생회·가족 모임이 정산 스트레스 없이 여행하고 있습니다
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70">
            <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs">
                C
              </span>
              캠핑클럽 코리아
            </div>
            <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                U
              </span>
              대학 연합 MT 네트워크
            </div>
            <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                J
              </span>
              제주 한달살이 크루
            </div>
            <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs">
                F
              </span>
              부울경 패밀리 투어
            </div>
            <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
              <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">
                R
              </span>
              주말 라이딩 & 러닝 크루
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. 핵심 기능 소개 ================= */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs sm:text-sm font-black text-[#1D68FE] tracking-wider uppercase">
              CORE FEATURES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 mb-4" style={{ wordBreak: 'keep-all' }}>
              여행 총무의 수고를 90% 줄여주는<br />
              꼭 필요한 4가지 핵심 기능
            </h2>
            <p className="text-slate-600 text-base sm:text-lg" style={{ wordBreak: 'keep-all' }}>
              복잡한 수식과 단체 채팅방 눈치 싸움은 그만. 스마트한 여행 경험을 위해 처음부터 끝까지 다정하게 챙겨드립니다.
            </p>
          </div>

          <div className="space-y-24">
            {/* 기능 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1D68FE] flex items-center justify-center font-bold text-xl mb-6 shadow-2xs">
                  01
                </div>
                <span className="text-xs font-bold text-[#1D68FE] bg-blue-50 px-3 py-1 rounded-full">
                  최소 송금 최적화
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-4" style={{ wordBreak: 'keep-all' }}>
                  “누가 누구한테 보내야 하지?”<br />
                  수십 번의 계좌 이체를 단 2~3번으로 압축
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 font-medium" style={{ wordBreak: 'keep-all' }}>
                  A가 장을 보고 B가 숙소를 예약하고 C가 기름값을 냈을 때, 이전에는 서로 주고받느라 정신이 없으셨죠?
                  탐욕 알고리즘(Minimum Cash Flow) 기반으로 전체 그룹 내 총 송금 횟수를 수학적으로 가장 적게 만들어 드립니다.
                </p>
                <ul className="space-y-2.5 text-sm font-bold text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1D68FE]" />
                    특정 항목(술·담배 등) 제외 인원 선택 1/N 지원
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1D68FE]" />
                    10원 단위 절사 및 공평한 잔여원 분배
                  </li>
                </ul>
              </div>

              <div className="bg-[#F4F8FF] rounded-3xl p-8 border border-blue-100">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <span className="text-xs font-bold text-slate-400">송금 복잡도 비교</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">
                      75% 감소
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>일반적인 정산 방식</span>
                        <span className="text-rose-500 font-bold">총 8회 이체 필요 ❌</span>
                      </div>
                      <div className="h-2 rounded-full bg-rose-200 overflow-hidden">
                        <div className="h-full bg-rose-500 w-full"></div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
                      <div className="flex justify-between text-xs text-[#1D68FE] mb-1">
                        <span className="font-bold">스마트 최적화 알고리즘</span>
                        <span className="font-black">단 2회 이체로 종료 ✅</span>
                      </div>
                      <div className="h-2 rounded-full bg-blue-200 overflow-hidden">
                        <div className="h-full bg-[#1D68FE] w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 기능 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-[#F0FDF8] rounded-3xl p-8 border border-emerald-100">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-black text-slate-800">
                        Supabase PostgreSQL 실시간 동기화
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      0.2초 갱신
                    </span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">📱 친구 핸드폰 화면</span>
                      <span className="font-black text-slate-900">새로고침 없이 영수증 자동 등장</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">💻 총무 PC 브라우저</span>
                      <span className="font-black text-slate-900">대화면 엑셀 스타일 빠른 입력</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mb-6 shadow-2xs">
                  02
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  실시간 자동 동기화
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-4" style={{ wordBreak: 'keep-all' }}>
                  PC와 스마트폰 어디서나<br />
                  새로고침 없이 똑같이 보는 실시간 데이터
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 font-medium" style={{ wordBreak: 'keep-all' }}>
                  기기마다 화면이 다르면 총무도 친구들도 불안합니다. 글로벌 표준 PostgreSQL 클라우드 DB를 통해
                  한 사람이 지출을 등록하거나 일정을 옮기면 모두의 폰에 딜레이 없이 즉시 반영됩니다.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium">
                  💡 <strong>오프라인 안심 백업:</strong> 네트워크 연결이 불안정한 산골 캠핑장에서도 브라우저 캐시로 일정을 잃어버리지 않습니다.
                </div>
              </div>
            </div>

            {/* 기능 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl mb-6 shadow-2xs">
                  03
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  지도 동선 시각화
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-4" style={{ wordBreak: 'keep-all' }}>
                  영수증과 일정 동선이<br />
                  지도 위에서 하나로 이어집니다
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 font-medium" style={{ wordBreak: 'keep-all' }}>
                  “우리 아까 마트 어디 갔었지?”, “다음 목적지까지 차로 얼마나 걸려?”<br />
                  카카오맵/리플릿(Leaflet) 연동 지도 위에서 일자별 여행 핀을 콕콕 찍고, 이동 시간과 예상 경비를 한 번에 확인하세요.
                </p>
                <ul className="space-y-2.5 text-sm font-bold text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600" />
                    장소 검색 및 주소 자동 위·경도 변환
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600" />
                    일정 순서 드래그 & 드롭 재배치
                  </li>
                </ul>
              </div>

              <div className="bg-[#F7F5FF] rounded-3xl p-8 border border-purple-100">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
                  <div className="h-44 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="px-3 py-1.5 rounded-full bg-[#1D68FE] text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                        <span>📍</span> 태안 갯벌 캠핑장
                      </div>
                      <div className="w-1 h-4 bg-[#1D68FE]"></div>
                      <div className="w-4 h-1.5 rounded-full bg-slate-300"></div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">안면도 꽃지해수욕장 ➔ 자연휴양림</span>
                    <span className="text-purple-600 font-black">차량 18분</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. 인터랙티브 미니 체험기 ================= */}
      <section id="calculator" className="py-20 bg-[#F0F7FD] border-y border-blue-100/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-[#1D68FE] text-xs font-black mb-4">
            <span>⚡ 3초 체험 위젯</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ wordBreak: 'keep-all' }}>
            직접 금액을 넣고 정산 결과를 확인해 보세요
          </h2>
          <p className="text-slate-600 mb-10 text-sm sm:text-base font-medium" style={{ wordBreak: 'keep-all' }}>
            총 결제 금액과 여행 인원만 입력하면, 1인당 얼마인지 즉시 투명하게 계산해 드립니다.
          </p>

          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-blue-100 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  여행 중 지출한 총 금액 (원)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(parseInt(e.target.value || "0", 10))}
                    step="10000"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-black text-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D68FE]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    원
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">함께 간 여행 인원</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => setCalcMembers(count)}
                      className={`py-3 rounded-xl text-sm font-bold transition ${
                        calcMembers === count
                          ? "border-2 border-[#1D68FE] bg-blue-50 text-[#1D68FE] font-black"
                          : "border border-slate-200 text-slate-700 hover:border-[#1D68FE]"
                      }`}
                    >
                      {count}명
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-[#1D68FE] uppercase tracking-wide">
                  RESULT · 1인당 부담 금액
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                  {perPerson.toLocaleString()} <span className="text-lg font-normal text-slate-600">원</span>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyMockResult}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#1D68FE] hover:bg-blue-600 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedToast ? "복사 완료! 카톡에 붙여넣으세요" : "카톡 정산문구 복사"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. 도입 후기 인용 ================= */}
      <section id="reviews" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-black text-[#1D68FE] tracking-wider uppercase">
              USER STORIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 mb-4" style={{ wordBreak: 'keep-all' }}>
              실제 사용자분들이 남겨주신 생생한 후기
            </h2>
            <p className="text-slate-600 text-base font-medium" style={{ wordBreak: 'keep-all' }}>
              여행 끝나고 며칠 동안 엑셀 붙잡고 있던 총무님들의 스트레스가 이렇게 사라졌습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#F4F8FF] border border-blue-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition duration-200">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">★★★★★</div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium" style={{ wordBreak: 'keep-all' }}>
                  “대학 동기 6명이서 2박 3일 글램핑 다녀왔는데, 장보기/기름값/숙소 결제자가 다 달라서 막막했거든요. 영수증 등록하자마자 단 3번의 이체로 정리되어 다들 감탄했습니다.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-blue-200/60">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  민수
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-slate-900">김민수 님</h4>
                  <p className="text-[11px] text-slate-500">대학생 연합 MT 총무</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#F0FDF8] border border-emerald-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition duration-200">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">★★★★★</div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium" style={{ wordBreak: 'keep-all' }}>
                  “술 안 마시는 친구 2명은 주류비에서 쏙 빼고 정산할 수 있는 게 신의 한 수였어요. 누구 하나 서운함 없이 깔끔하게 떨어지니 다음 모임도 무조건 이걸로 쓰기로 했습니다.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-emerald-200/60">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  지연
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-slate-900">이지연 님</h4>
                  <p className="text-[11px] text-slate-500">직장인 제주도 워크숍 기획자</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#F7F5FF] border border-purple-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition duration-200">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">★★★★★</div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium" style={{ wordBreak: 'keep-all' }}>
                  “모바일이랑 PC가 실시간으로 동기화되니까, 차 안에서 제가 폰으로 결제내역 올리고 남편이 조수석에서 코스 확인하는 게 너무 편했어요. 정산 문구 복사 기능도 최고예요.”
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-purple-200/60">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                  주연
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-slate-900">박주연 님</h4>
                  <p className="text-[11px] text-slate-500">부울경 주말 가족 캠핑 플래너</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. 하단 전환 배너 ================= */}
      <section className="py-20 lg:py-28 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black mb-6 border border-blue-400/30">
            <span>🎉 별도 설치 없이 링크 하나로 바로 공유</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight" style={{ wordBreak: 'keep-all' }}>
            이번 주말 여행부터<br />
            정산 스트레스와 영별하세요.
          </h2>
          
          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-10 font-medium" style={{ wordBreak: 'keep-all' }}>
            회원가입 절차 없이 3초 만에 우리 모임 여행방을 만들고 친구들에게 링크를 보내보세요.
          </p>

          <button
            onClick={onStartApp}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#1D68FE] hover:bg-blue-600 text-white text-lg font-black shadow-xl shadow-blue-500/30 hover:scale-105 transition"
          >
            <span>무료로 우리 여행 만들기 →</span>
          </button>
        </div>
      </section>

      {/* ================= 7. 푸터 ================= */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#1D68FE] text-white flex items-center justify-center font-bold text-xs">
              W
            </div>
            <span className="font-black text-slate-900">우정여행&더치페이</span>
            <span className="text-slate-300">|</span>
            <span>대표자: 임원석</span>
            <span className="text-slate-300">|</span>
            <span>인프라: Vercel & Supabase</span>
          </div>
          <p className="text-slate-400">
            © 2026 TravelDutch Inc. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================= 8. 채널톡 스타일 플로팅 챗봇 말풍선 위젯 ================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {showChatTip && (
          <div className="mb-3 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
            <span>궁금한 점이 있으신가요? 💬</span>
            <button
              onClick={() => setShowChatTip(false)}
              className="text-slate-400 hover:text-white ml-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <button
          onClick={() => setShowChatModal((p) => !p)}
          className="w-14 h-14 rounded-full bg-[#1D68FE] hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all duration-200 group"
        >
          <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        </button>

        {showChatModal && (
          <div className="absolute bottom-18 right-0 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left mb-3 z-50">
            <div className="bg-[#1D68FE] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
                  ✈️
                </div>
                <div>
                  <h4 className="font-black text-sm">더치페이 도우미봇</h4>
                  <p className="text-[11px] text-blue-100">실시간 질문에 답변해 드려요</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-96 overflow-y-auto text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1D68FE] flex items-center justify-center font-bold text-xs shrink-0">
                  톡
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 text-slate-800 leading-relaxed font-medium">
                  안녕하세요! 반가워요 😊<br />
                  <strong>우정여행&더치페이</strong>에 대해 궁금하신 점을 눌러보세요!
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleReplyChat("무료")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#1D68FE] hover:bg-blue-50/50 font-bold text-slate-700 transition"
                >
                  👉 진짜 100% 무료로 쓸 수 있나요?
                </button>
                <button
                  onClick={() => handleReplyChat("알고리즘")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#1D68FE] hover:bg-blue-50/50 font-bold text-slate-700 transition"
                >
                  👉 최소 송금 횟수는 어떻게 계산되나요?
                </button>
                <button
                  onClick={() => handleReplyChat("친구")}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#1D68FE] hover:bg-blue-50/50 font-bold text-slate-700 transition"
                >
                  👉 친구들도 앱을 설치해야 하나요?
                </button>
              </div>

              {chatAnswer && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 leading-relaxed font-medium">
                  {chatAnswer}
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={onStartApp}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1D68FE] hover:bg-blue-600 text-white font-black text-xs transition"
              >
                지금 바로 우리 여행 시작하기 →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
