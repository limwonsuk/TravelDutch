import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '우정여행&더치페이',
  description: '일정 타임라인, 동선 지도 & 동행자 최소 송금 더치페이 경비 자동 정산',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
