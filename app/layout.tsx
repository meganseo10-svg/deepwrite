import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEEPWRITE — AI 영어 작문 트레이너",
  description:
    "내가 쓴 영어를 통역사가 옆에서 고쳐주듯 5차원으로 분석하고, 왜 그렇게 써야 하는지까지 알려주는 작문 트레이너.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 08 §3: Pretendard(한국어 포함) + JetBrains Mono */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
      </head>
      <body className="bg-paper text-ink min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
