import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediTime - 약 복용 시간 추천 서비스',
  description: '생체리듬 기반 과학적 약 복용 시간 추천 헬스케어 서비스',
  keywords: ['약 복용', '시간 추천', '생체리듬', '건강관리', '약물'],
  authors: [{ name: 'MediTime Team' }],
  openGraph: {
    title: 'MediTime - 약 복용 시간 추천 서비스',
    description: '생체리듬 기반 과학적 약 복용 시간 추천 헬스케어 서비스',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
