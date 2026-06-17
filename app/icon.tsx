import { ImageResponse } from "next/og";

// 생성형 파비콘 — 브랜드 청록(#0EB5A6) 바탕에 "D". 기본 Next 로고 대체.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0EB5A6",
          color: "white",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        D
      </div>
    ),
    size,
  );
}
