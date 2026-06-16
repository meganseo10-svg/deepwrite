# 02. TECH SPEC — DEEPWRITE 기술 사양

## 1. 스택
- **Next.js 14 App Router + TypeScript (strict)**
- **Supabase**: Auth(이메일/Google), Postgres, Row Level Security
- **Tailwind CSS** + 최소 컴포넌트 (shadcn/ui 선택적)
- **Anthropic Claude API** (`@anthropic-ai/sdk`)
- **Zod** 입력 검증, **SWR** 또는 React Query 데이터 페칭
- **Vercel** 배포 / **토스페이먼츠**(국내) 또는 Stripe 결제

## 2. 폴더 구조
```
deepwrite/
├── app/
│   ├── (auth)/login/            로그인·가입
│   ├── (app)/
│   │   ├── dashboard/           홈: 오늘의 과제·약점·추이
│   │   ├── write/               작문 에디터 (핵심 화면)
│   │   ├── backtranslate/       역번역 모드
│   │   ├── weakness/            약점 리포트
│   │   └── onboarding/          진단
│   ├── api/
│   │   ├── analyze/route.ts     5차원 진단+리라이트
│   │   ├── tone/route.ts        3톤 변환
│   │   ├── hint/route.ts        라이브 힌트(콜로케이션·비교단어)
│   │   ├── backtranslate/route.ts
│   │   └── weakness/route.ts
│   └── layout.tsx
├── components/
│   ├── editor/                  Editor, DiffView, ScorePanel, HintPopover
│   ├── tone/                    ToneSelector, ThreeToneCompare
│   └── ui/                      deepread에서 복사한 공통 컴포넌트
├── lib/
│   ├── supabase/                client.ts, server.ts
│   ├── llm/                     anthropic.ts, prompts.ts, cache.ts
│   ├── schemas/                 zod 스키마
│   └── scoring/                 약점 집계 로직
├── supabase/migrations/         SQL 마이그레이션
├── styles/tokens.css            ← deepread에서 복사
└── .env.local
```

## 3. 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 서버 전용
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
# 결제 (Phase 1 후반)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

## 4. ⭐ deepread 디자인 복사법 (시각 통일성)
> deepread를 import 하지 말고, **복사**로만 맞춘다.
1. `C:\Users\Megan\Documents\deepread`에서 다음을 deepwrite로 복사:
   - `tailwind.config.ts` (색·폰트·spacing 토큰)
   - 전역 CSS / 디자인 토큰 파일 (CSS 변수)
   - 공통 UI 컴포넌트(Button, Card, Badge, Tabs 등) → `components/ui/`
2. 컬러·타이포·라운드·그림자 값이 deepread와 **픽셀 단위로 동일**해야 함.
3. 브랜드만 교체: 로고/이름 `DEEPREAD` → `DEEPWRITE`, 액센트 컬러는 동일 팔레트 유지(원하면 보조색 1개만 변형).
4. 헤더에 **"← DEEPREAD로" 링크**(딥링크)를 넣어 생태계 느낌.

## 5. LLM 모델 분리 (비용)
| 용도 | 권장 모델 | 이유 |
|---|---|---|
| 라이브 힌트(콜로케이션·비교단어) | 경량/빠른 모델 | 짧고 잦음, 저지연 필요 |
| 5차원 진단 + 리라이트 + "왜" | 고성능 모델 | 품질이 제품의 핵심 |
| 3톤 변환 | 고성능 모델 | 뉘앙스 정확도 중요 |
| 역번역 + 의도 일치 채점 | 고성능 모델 | 정밀도 중요 |
> 모델 ID는 사용자가 .env 또는 `lib/llm/anthropic.ts` 상단 상수로 관리. 최신 가용 모델은 사용자에게 확인.

## 6. 캐싱 전략
- 동일 (문장 해시 + 톤) → 진단 결과 캐시(전역 공유 가능, 개인정보 없는 일반 표현만).
- 비교 단어 카드는 단어+톤 기준 캐시 (재사용률 높음).
- 캐시 키: `sha256(normalizedText + tone + mode)`.

## 7. 스트리밍
진단·리라이트는 Anthropic 스트리밍으로 토큰을 흘려보내 체감 지연을 줄인다. 5차원 점수는 JSON 마지막에 한 번에.
