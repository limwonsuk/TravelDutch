# 🏕️ 우정여행&더치페이 (TravelDutch)

> **Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, Supabase(PostgreSQL), Leaflet(OpenStreetMap)** 기반의  
> 실시간 클라우드 DB 연동 여행 일정 타임라인 & 동행자 최소 송금 더치페이 자동 정산 풀스택 웹 애플리케이션

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Fullstack-black?logo=vercel)

---

## 🌟 핵심 기능

1. **🗺️ 일정 & 동선 지도 (Leaflet + OpenStreetMap)**
   - Day별 탭 전환 및 시간순 타임라인 카드
   - 실시간 순서 변경 (위/아래 이동) 및 지도 커스텀 번호 핀 & 점선 Polyline 동선 연결
   - 일정 추가 모달 내 **실시간 주소 / 장소명 검색** (Nominatim API)
   - 모달 내 지도에서 원하는 위치를 마우스로 직접 클릭 시 위도/경도 자동 세팅

2. **💰 경비 내역 & 더치페이 최소 송금 (Greedy 알고리즘)**
   - 총 지출액, 1인당 평균 분담액, 카테고리별 지출 비율 프로그레스 바
   - 지출 등록 시 N분의 1 자동 분배 및 10원 단위 반올림 오차 자동 보정
   - **최소 송금 정산표 (Minimum Cash Flow)**: 불필요한 거래를 묶어 최소 거래 횟수로 '누가 ➔ 누구에게 얼마 송금' 시각화
   - 원클릭 카카오톡/메신저 공유용 텍스트 복사

3. **☁️ Vercel + Supabase 클라우드 실시간 DB 연동**
   - 브라우저 로컬 저장을 넘어 **Supabase(PostgreSQL)** 클라우드 DB에 데이터 영구 보관
   - 여러 친구들이 서로 다른 스마트폰이나 PC에서 접속해도 동일한 일정과 경비 내역을 실시간으로 함께 확인 및 수정 가능

---

## 🚀 Vercel + Supabase 연동 배포 가이드 (3분 완성)

### 1단계: Supabase 프로젝트 생성 및 DB 접속 주소 확인
1. **[Supabase](https://supabase.com)** 에 접속하여 로그인 후 **New Project**를 생성합니다.
2. 프로젝트 생성 후 좌측 메뉴에서 **Project Settings (⚙️) ➔ Database** 로 이동합니다.
3. **Connection string** 섹션에서 다음 두 가지 주소를 확인합니다:
   - **Connection Pooling (`Session` 또는 `Transaction` 모드)**: 포트 `6543` ➔ `DATABASE_URL`로 사용
   - **Direct connection**: 포트 `5432` ➔ `DIRECT_URL`로 사용
   *(비밀번호 부분 `[YOUR-PASSWORD]`를 프로젝트 생성 시 입력한 DB 비밀번호로 변경)*

### 2단계: 로컬에서 Supabase로 초기 테이블 푸시 (선택)
```bash
# .env 파일 생성 후 Supabase URL 입력
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase DB에 테이블 스키마 즉시 푸시
npx prisma db push
```

### 3단계: Vercel에 GitHub 레포지토리 연결 및 환경변수 등록
1. **[Vercel](https://vercel.com)** 에 접속하여 **Add New... ➔ Project**를 누르고 **`TravelDutch`** 레포지토리를 선택합니다.
2. **Environment Variables** 섹션에 아래 2개의 환경 변수를 추가합니다:
   - **`DATABASE_URL`**: Supabase Connection Pooling 주소 (포트 6543)
   - **`DIRECT_URL`**: Supabase Direct connection 주소 (포트 5432)
3. **Deploy** 버튼을 누릅니다!
   - Vercel이 자동으로 Next.js 빌드 및 Prisma 클라이언트를 구성하여 배포를 완료합니다.
   - 첫 접속 시 DB가 비어있으면 `GET /api/trip`이 자동으로 초기 일정(태안 갯벌 캠핑)과 7건의 경비 내역을 Supabase에 주입(Auto-seed)합니다.

---

## 💻 로컬 개발 환경 실행

```bash
# 종속성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 개발 서버 구동
npm run dev
```
브라우저에서 `http://localhost:3000` 접속
