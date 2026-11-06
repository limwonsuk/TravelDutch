# 🏕️ 우정여행&더치페이 (여행 플래너 & 더치페이 정산기)

> **Next.js 14, TypeScript, Tailwind CSS, Prisma(SQLite), Leaflet(OpenStreetMap)** 기반의  
> 여행 일정 타임라인 & 동행자 최소 송금 더치페이 경비 자동 정산 웹 애플리케이션

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748?logo=prisma)
![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900?logo=leaflet)

---

## 🌟 핵심 기능

### 1. 📅 일정 & 동선 맵 뷰 (2단 반응형 레이아웃)
- **Day별 탭 전환**: Day 1 ~ Day 4 여행 코스 분할 조회
- **타임라인 카드 & 실시간 순서 변경**: 위/아래 이동 버튼(Up/Down)으로 방문 순서 즉시 재정렬
- **인터랙티브 지도 연동**: OpenStreetMap 기반 순서 번호 커스텀 배지 마커 및 점선 폴리라인(Polyline) 동선 연결
- **지도 위치 선택 피커**: 일정 추가 모달 내 지도에서 원하는 장소를 클릭하면 위도/경도가 즉시 자동 세팅
- **부산 12대 명소 빠른 프리셋**: 해운대, 광안리, 해동용궁사, 자갈치시장 등 원클릭 좌표 자동 입력

### 2. 💰 경비 내역 & 더치페이 정산 뷰
- **총 지출액 & 1인당 평균 부담액 요약**: 카테고리별(식비, 숙박, 교통, 입장료 등) 지출 분포 프로그레스 바
- **최소 송금(Minimum Cash Flow) 정산표**:
  - 그리디 알고리즘 기반으로 불필요한 송금을 묶어 최소 거래 횟수로 정산 완성
  - '누가 ➔ 누구에게 얼마 송금' 시각적 화살표 카드 제공
  - 10원 단위 반올림 및 절사 오차 자동 보정
- **동행자별 순잔액 현황**: 총 지불액 vs 총 분담액(양수: 수령, 음수: 송금) 카드
- **원클릭 메신저 공유**: 카카오톡/메신저 공유용 정산 요약 텍스트 클립보드 복사

---

## 🚀 빠른 시작 (Local Setup)

### 1. 패키지 설치
```bash
npm install
```

### 2. 데이터베이스 설정 및 시드 데이터 주입
```bash
# SQLite DB 생성 및 스키마 반영
npx prisma db push

# 5인 3박 4일 시드 데이터 주입
npm run prisma:seed
```

### 3. 개발 서버 구동
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

---

## 🧪 테스트 실행
```bash
npm test
```
- 그리디 알고리즘 단위 테스트 (최소 거래 횟수 및 10원 단위 보존 검증)
