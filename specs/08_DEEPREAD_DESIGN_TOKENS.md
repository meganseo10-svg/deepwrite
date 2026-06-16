# 08. DEEPREAD 디자인 토큰 (DEEPWRITE 룩 맞추기용)

> ⚠️ **중요 정정**: 02/07 문서는 "deepread의 `tailwind.config`·`components/ui`를 **복사**하라"고 하지만,
> **deepread에는 그런 파일이 없습니다.** deepread의 실제 스택은:
> - **Vite + React (순수 JSX, TypeScript 아님)** + **Express / Vercel 서버리스 함수** (Next.js 아님)
> - 디자인 = `src/App.jsx` 안의 거대한 CSS 문자열 + `.dr { --변수 }` CSS 변수 (Tailwind 아님)
>
> 따라서 "복사"가 불가능합니다. 대신 **아래 실제 값으로 DEEPWRITE의 Tailwind를 구성**해
> 픽셀 단위로 같은 룩을 **재현**하세요. (이 값들은 deepread `src/App.jsx`의 `.dr` 블록에서 직접 추출.)

---

## 1. 컬러 팔레트 (실제 값)

| 토큰 | HEX | 용도 |
|---|---|---|
| paper | `#F2FAF6` | 배경(메인) |
| paper2 | `#FBFFFD` | 배경(밝은 영역) |
| card | `#FFFFFF` | 카드/패널 |
| ink | `#243239` | 본문 텍스트(짙은 청회색) |
| soft | `#5E6E73` | 보조 텍스트 |
| faint | `#9BAAAE` | 흐린 텍스트/플레이스홀더 |
| line | `#E4EFEB` | 옅은 구분선 |
| line2 | `#D2E3DD` | 진한 구분선/테두리 |
| **ox (primary)** | `#0EB5A6` | **브랜드 강조색(청록)** |
| ox-d | `#0A9A8C` | 강조색 hover(진한 청록) |
| gold | `#FF8A3D` | 경고/포인트(주황) |
| sage | `#22C55E` | 성공(초록) |
| slate | `#2DB6F5` | 정보(파랑) |

## 2. 그라데이션 · 그림자 · 하이라이트
```
--grad:   linear-gradient(135deg, #13CCA8 0%, #2DA8F5 100%);   /* 주요 버튼/막대 (청록→파랑) */
--grad2:  linear-gradient(135deg, #FFB020 0%, #FF7A59 100%);   /* 보조 (노랑→주황) */
--shadow: 0 12px 28px -18px rgba(20,70,62,.20);                /* 카드 그림자 */
--hl-word: rgba(14,181,166,.15);   /* 단어 하이라이트(청록) */
--hl-sent: rgba(45,182,245,.10);   /* 문장 하이라이트(파랑) */
```

## 3. 타이포그래피
- **본문/제목 폰트:** `Pretendard` (한국어 포함). 폴백: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`
- **모노:** `JetBrains Mono`, 폴백 `ui-monospace, 'Pretendard', monospace`
- 본문 `line-height: 1.6`, `letter-spacing: -0.005em`, `-webkit-font-smoothing: antialiased`
- 한국어 줄바꿈: `word-break: keep-all; overflow-wrap: break-word;` (deepread 전역 적용 — 어절 단위로 깔끔하게 끊김)
- ⚠️ Pretendard·JetBrains Mono 웹폰트를 deepwrite에서도 로드해야 함(예: `pretendard` npm 패키지 또는 CDN).

## 4. 자주 쓰는 라운드(border-radius)
| 용도 | 값 |
|---|---|
| 작은 버튼/배지 | `8px` |
| 일반 버튼 | `11px` |
| 카드/패널 | `14px` |

---

## 5. Tailwind 적용 예시 (`tailwind.config.ts`)
```ts
import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2FAF6", paper2: "#FBFFFD", card: "#FFFFFF",
        ink: "#243239", soft: "#5E6E73", faint: "#9BAAAE",
        line: "#E4EFEB", line2: "#D2E3DD",
        ox: { DEFAULT: "#0EB5A6", dark: "#0A9A8C" },
        gold: "#FF8A3D", sage: "#22C55E", slate: "#2DB6F5",
      },
      backgroundImage: {
        brand: "linear-gradient(135deg,#13CCA8 0%,#2DA8F5 100%)",
        brand2: "linear-gradient(135deg,#FFB020 0%,#FF7A59 100%)",
      },
      boxShadow: { card: "0 12px 28px -18px rgba(20,70,62,.20)" },
      borderRadius: { btn: "11px", card: "14px" },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Pretendard", "monospace"],
      },
    },
  },
} satisfies Config;
```

## 6. 브랜드 일관성 메모
- deepread는 최근 **보라(#863bff) 잔재를 전부 청록·파랑(브랜드색)으로 통일**했음. DEEPWRITE도 같은 청록(`#0EB5A6`)·파랑(`#2DB6F5`) 팔레트를 그대로 쓰고, 원하면 **보조 액센트 1개만** 살짝 다르게(예: 작문 앱이니 `gold/#FF8A3D` 계열을 포인트로) 변형 권장.
- 헤더에 "← DEEPREAD로" 딥링크(02 §4-4) 넣어 생태계 느낌 유지.
- 다크모드: deepread 본체는 라이트 기준 팔레트(위 값). 다크모드가 필요하면 deepwrite에서 별도 정의 필요(deepread에 완성된 다크 토큰 세트는 없음).
