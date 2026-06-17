# DEPLOY — DEEPWRITE 배포 + QA (T15)

> 코드는 배포 가능 상태(빌드/타입/lint green, OAuth 리다이렉트는 요청 origin 기반이라 하드코딩 URL 없음).
> 실제 배포는 ① Vercel 계정 ② Supabase 프로덕션 설정 ③ Anthropic 크레딧이 필요(아래 순서대로).

## 1. Vercel 프로젝트 생성 (deepread와 별도)
1. https://vercel.com → **Add New… → Project → Import Git Repository**
2. `meganseo10-svg/deepwrite` 선택 (Framework: Next.js 자동 인식)
3. 빌드 설정 기본값 그대로 (`next build`). Root Directory `.`
4. 아래 환경변수 입력 후 **Deploy**

## 2. 환경변수 (Vercel → Settings → Environment Variables, Production)
`.env.example` 참고. 값은 `.env.local`에서 가져오되 `NEXT_PUBLIC_APP_URL`만 프로덕션 도메인으로.

| 변수 | 값 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (ref `mqqpdtbayihbjlsnfxgf`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` (anon 대체 신키) |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_…` (서버 전용, 절대 NEXT_PUBLIC 금지) |
| `ANTHROPIC_API_KEY` | Anthropic 키 (deepread와 공유) |
| `ANTHROPIC_MODEL_HEAVY` | `claude-opus-4-8` |
| `ANTHROPIC_MODEL_LIGHT` | `claude-haiku-4-5` |
| `NEXT_PUBLIC_APP_URL` | `https://<배포도메인>` |
| `NEXT_PUBLIC_DEEPREAD_URL` | deepread 배포 URL (헤더/대시보드 딥링크) |

> 결제(TOSS_*)는 T14 보류 — 미설정으로 둬도 빌드/동작 영향 없음.

## 3. Supabase 프로덕션 설정
1. **DB 마이그레이션**: SQL Editor에서 순서대로 적용
   - `supabase/migrations/0001_init.sql` (적용 완료)
   - `supabase/migrations/0002_usage_events.sql` (**미적용 — 반드시 적용**: 톤 미리보기 게이트용)
2. **Auth → URL Configuration**
   - Site URL: `https://<배포도메인>`
   - Redirect URLs에 `https://<배포도메인>/auth/callback` 추가
3. **Google 로그인 쓸 경우**: Auth → Providers → Google 활성화 + OAuth 클라이언트 등록
   (미설정이면 이메일/비번 로그인만 동작 — 기능엔 지장 없음)
4. **Email confirm**: 현재 켜짐(`mailer_autoconfirm:false`) → 일반 가입은 메일 인증 필요

## 4. Anthropic 크레딧 (라이브 LLM 블로커)
- console.anthropic.com → Plans & Billing → 크레딧 충전
- 충전 전에는 모든 LLM 호출이 `400 credit balance too low` (analyze/tone/hint/compare/backtranslate/onboarding)
- 크레딧과 **무관하게 동작**하는 기능: 인증, 약점 리포트(`/weakness`), 대시보드(`/dashboard`) — 누적 데이터 기반

## 5. 배포 후 전체 여정 QA (00 README MVP 정의)
- [ ] 가입 → (메일 인증) → 로그인, 세션 유지/로그아웃
- [ ] 온보딩 `/onboarding`: 글 3개 → 추정 CEFR + 최약점, 대시보드에 베이스라인 배지
- [ ] 작문 `/write`: 진단 → 5차원 점수 + Diff + "왜" 설명, free 일 3회 게이트
- [ ] 라이브 힌트: 단어 입력 시 콜로케이션 팝오버(힌트모드 즉시/시도후/끄기)
- [ ] 비교 카드: 단어 더블클릭 → Pro 카드 / free 자물쇠
- [ ] 3톤 비교: `[3톤으로 비교]` → 3컬럼 + 드라이버 표 + 일관성(Pro)
- [ ] 역번역 `/backtranslate`: 의도 → 영어 → 역번역/일치도/소실뉘앙스/모범 (채점 Pro)
- [ ] 약점 `/weakness`: 누적 오류 랭킹 + 추이 + 맞춤 드릴
- [ ] 대시보드 `/dashboard`: 오늘의 과제 / streak / 점수추이 / 최근작문 / DEEPREAD 딥링크
- [ ] Free↔Pro 전환(`profiles.plan` 수동 변경)으로 게이트 동작 확인 (§2 tone, §3-b compare, §4 backtranslate-score)
