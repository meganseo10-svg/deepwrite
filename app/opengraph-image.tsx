import { ImageResponse } from "next/og";

// 공유 미리보기(OG/트위터) 카드 — 인디고 브랜드. 한글 폰트 의존을 피하려
// 이미지 텍스트는 영문, 메타 제목/설명(한글)은 layout.tsx 가 담당.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DEEPWRITE — AI 영어 작문 트레이너";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #7c6cff 0%, #a78bfa 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -3 }}>
          DEEPWRITE
        </div>
        <div style={{ fontSize: 40, marginTop: 14, opacity: 0.95 }}>
          5-dimension English writing trainer
        </div>
        <div style={{ fontSize: 27, marginTop: 30, opacity: 0.82 }}>
          Lexis · Collocation · Structure · Grammar · Tone
        </div>
      </div>
    ),
    size,
  );
}
