import type { Metadata } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.startsWith("https")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://deepwrite-nu.vercel.app";

const TITLE = "DEEPWRITE — AI 영어 작문 트레이너";
const DESCRIPTION =
  "내가 쓴 영어를 통역사가 옆에서 고쳐주듯 5차원으로 분석하고, 왜 그렇게 써야 하는지까지 알려주는 작문 트레이너.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "DEEPWRITE",
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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
