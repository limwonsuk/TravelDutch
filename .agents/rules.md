---
name: travel-planner-architecture-rules
description: Next.js + Leaflet + SQLite 기반 여행 플래너 및 더치페이 정산기 자율 구현 규칙
---
# 핵심 개발 및 검증 규칙

1. **Leaflet SSR 충돌 방지 필수**:
   - `leaflet` 및 `react-leaflet`을 사용하는 모든 지도 컴포넌트는 반드시 `'use client'`로 작성하고, 부모 컴포넌트에서 `next/dynamic`의 `{ ssr: false }` 옵션으로 불러와야 한다.
   - 기본 마커 아이콘 깨짐을 방지하기 위해 `L.divIcon` 기반의 커스텀 번호 배지 마커(Tailwind 스타일링 적용)를 사용한다.

2. **최소 송금 횟수(Minimum Cash Flow) 더치페이 알고리즘**:
   - 각 동행자의 순잔액(`총 지불액 - 총 부담액`)을 계산한 뒤, 받을 사람(양수)과 보낼 사람(음수) 배열을 정렬하여 그리디(Greedy) 매칭으로 송금 횟수를 최소화한다.
   - 원화(KRW) 기준 10원 단위 반올림 처리를 명확히 하여 총합 오차가 발생하지 않도록 하고, 알고리즘에 대한 단위 테스트를 포함한다.

3. **자율 검증 루프 완료 조건**:
   - 코드 작성 후 반드시 개발 서버를 띄우고 테스트 시나리오를 직접 검증해 콘솔 에러(`console.error`)와 런타임 예외가 0건인지 확인한다.
