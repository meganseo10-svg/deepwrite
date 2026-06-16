# DEEPWRITE — 개발 핸드오프 (다른 PC에서 이어가기)

상급 한국인 영어 학습자용 **AI 작문 트레이너**. 사용자가 쓴 영어를 통역사처럼 **5차원 진단 + 네이티브 리라이트 + "왜" 설명**하고, 멀티톤·라이브 힌트·역번역·약점 추적을 제공한다. (자매 앱 deepread = "읽기", DEEPWRITE = "쓰기".)

## 스택
- **Next.js 16 (App Router) + React 19 + TypeScript(strict)**
- **Tailwind CSS v4** — `tailwind.config.ts` 없음. 디자인 토큰은 `app/globals.css`의 `@theme`로 정의 (deepread 룩 재현, `specs/08_*.md`).
- **Supabase** (Auth + Postgres + RLS) — deepread와 **별도 프로젝트**
- **Anthropic Claude API** — HEAVY=`claude-opus-4-8`(진단·3톤·역번역), LIGHT=`claude-haiku-4-5`(힌트). 구조화 출력(`messages.parse` + `zodOutputFormat`).
- 미들웨어: Next 16 컨벤션상 `middleware.ts`가 아니라 **`proxy.ts`** (export `proxy`).

## 새 PC에서 시작하기
```bash
# 1) 코드 가져오기 (git clone 또는 폴더 복사)
cd deepwrite
npm install

# 2) 환경변수 — .env.example 보고 .env.local 새로 작성 (git에 없음!)
#    필요한 키:
#    NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY(sb_publishable_...) / SUPABASE_SERVICE_ROLE_KEY(sb_secret_...)
#    ANTHROPIC_API_KEY / ANTHROPIC_MODEL_HEAVY / ANTHROPIC_MODEL_LIGHT
#    Supabase 키: 대시보드 → Project Settings → API
#    (Supabase 프로젝트 ref: mqqpdtbayihbjlsnfxgf — 같은 DB를 쓰려면 동일 키 사용)

# 3) DB: 기존 Supabase 프로젝트를 그대로 쓰면 이미 적용됨.
#    새 Supabase 프로젝트라면 supabase/migrations/0001_init.sql 을 SQL Editor에 붙여 Run.

npm run dev      # http://localhost:3000
npm run build    # 타입체크 + 빌드
npx tsc --noEmit # 타입만
```

## 진행 상황 (티켓: `specs/07_TICKETS.md`)
- ✅ **T01** 부트스트랩 — Tailwind v4 @theme 토큰, UI 프리미티브(Card/Button/Badge), AppHeader(+DEEPREAD 딥링크), `/dashboard` 골격
- ✅ **T02** 인증 — `@supabase/ssr`, `lib/supabase/{client,server,admin}.ts`, `proxy.ts` 세션 미들웨어+보호경로, `(auth)/login`(이메일+Google), OAuth 콜백. **실제 키로 가입/로그인/로그아웃/세션 검증 완료.**
- ✅ **T03** DB — `supabase/migrations/0001_init.sql`(6테이블+뷰+RLS). 스펙 대비 보강: `llm_cache` RLS on+정책無(service_role 전용), `weakness_summary` `security_invoker=on`, `auth.users`→`profiles` 자동생성 트리거. **service_role REST로 검증 완료.**
- ✅ **T04** LLM 레이어 — `lib/llm/{anthropic,prompts,cache,generate}.ts`, `lib/schemas/llm.ts`(Zod 전체). 스키마 7/7 로컬 통과.
- ✅ **T05** 에디터 골격 — `/write` 2단(모바일 탭), `ToneSelector`+힌트모드 토글, textarea, 선택값 `profiles`에 저장.
- ✅ **T06** 진단 — `POST /api/analyze`(인증·free 일3회 게이트·writings/weakness_events 적재), `ScoreBars/DiffView/ExplanationCard`.
- ✅ **T07** 콜로케이션 힌트 — `POST /api/hint/collocation`(경량+캐시), `HintPopover`, 힌트모드 트리거.
- ✅ **T08** 비교 단어 카드 — `POST /api/hint/compare`(Pro 게이트), `CompareCard`, `PlanLock`.
- ⬜ **T09** 3톤 변환 → **다음 차례**: `POST /api/tone` + `/api/tone/consistency`, `ThreeToneCompare`.
- ⬜ T10 역번역 / T11 약점 리포트 / T12 온보딩 / T13 대시보드 / T14 결제 / T15 배포·QA

## ⚠️ 중요 메모
- **Anthropic 크레딧 부족** — API 키는 유효하나 잔액 부족으로 모든 LLM 호출이 `400 credit too low`. **라이브 LLM 검증(T06 1차 가치검증 포함)은 크레딧 충전 후.** T04~T08은 빌드/타입/인증게이트까지만 검증된 "코드-온리" 상태.
- 각 라우트는 미인증 시 `401 UNAUTHENTICATED`, 에러 포맷 `{error:{code,message}}`(05 스펙).
- Supabase 이메일 확인(Confirm email)이 켜져 있음 → 일반 가입은 메일 인증 필요(테스트는 admin API `email_confirm:true`).
- 검증은 `service_role` REST 스크립트로 수행했음(브라우저 세션 없이). 라이브 UI 흐름은 로그인 후 브라우저에서 확인 권장.
- **deepread 폴더는 건드리지 않음** — 디자인은 `specs/08`의 토큰값으로 재현만.

## 작업 규칙
- `specs/07_TICKETS.md`를 위에서부터 한 티켓씩. 티켓 끝나면 멈추고 보고 → 확인받고 다음.
- 사양이 모호하면 임의 판단 금지, 질문.
- 모델 ID는 임의 변경 금지(`.env`로 관리).
