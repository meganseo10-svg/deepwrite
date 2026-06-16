# 07. TICKETS — DEEPWRITE 빌드 순서

> 위에서부터 하나씩. 각 티켓 끝나면 멈추고 "T0X 완료" 보고 + Vercel preview.
> "Done when"을 모두 만족해야 완료.

---

### T01 — 프로젝트 부트스트랩
- `create-next-app`(TS, App Router, Tailwind) `C:\Users\Megan\Documents\deepwrite`
- deepread에서 `tailwind.config`·디자인 토큰·`components/ui` 복사 (02 §4)
- 브랜드명 DEEPWRITE로 교체, 헤더에 DEEPREAD 딥링크
- **Done when:** `npm run dev`로 빈 대시보드가 deepread와 동일한 룩으로 뜬다.

### T02 — Supabase 연결 + 인증
- `lib/supabase/client.ts`·`server.ts`, 이메일+Google 로그인, `(auth)/login`
- **Done when:** 가입·로그인·로그아웃 동작, 세션 유지.

### T03 — DB 마이그레이션
- `03_DATA_MODEL.sql`을 `supabase/migrations/0001_init.sql`로 실행
- RLS 정책 확인
- **Done when:** 6개 테이블 + 뷰 생성, RLS로 타인 데이터 접근 차단 확인.

### T04 — LLM 클라이언트 + 캐시 + 스키마
- `lib/llm/anthropic.ts`(모델 분리 상수), `prompts.ts`(04 전문), `cache.ts`(llm_cache)
- `lib/schemas/`에 모든 응답 Zod 스키마
- **Done when:** 테스트 호출로 §1 JSON이 스키마 통과.

### T05 — 작문 에디터 골격 + 톤 선택  ⭐
- `/write` 2단 레이아웃, `ToneSelector`(격식/중립/구어), 힌트모드 토글, textarea
- **Done when:** 톤·힌트모드 선택 상태가 저장되고 UI 반영.

### T06 — /api/analyze + 5차원 진단 + Diff + "왜"  ⭐ 최우선 가치
- 05 §analyze 구현, 스트리밍, writings·weakness_events 적재
- 우측에 `ScoreBars`·`DiffView`·`ExplanationCard`
- free 일 3회 게이트
- **Done when:** 글 입력→톤 반영된 5차원 점수+리라이트+이유가 화면에, DB 적재.

### T07 — 라이브 콜로케이션 힌트  ⭐ (요구사항 2)
- `/api/hint/collocation`(경량모델+캐시), `HintPopover`
- 힌트모드(즉시/시도후/끄기) 동작
- **Done when:** 단어 입력 시 빈도·격식·Konglish 경고 팝오버, 톤별 정렬.

### T08 — 비교 단어 카드  ⭐ (요구사항 2)
- `/api/hint/compare`, 단어 선택 시 `CompareCard`(근의어·강도·반의어)
- pro 게이트(`PlanLock`)
- **Done when:** 단어 선택→비교 카드, free는 자물쇠.

### T09 — 3톤 동시 변환  ⭐ (요구사항 1)
- `/api/tone` + 3컬럼 비교 + 드라이버 표, `/api/tone/consistency`
- **Done when:** 한 문장이 3톤으로, 무엇이 톤을 만드는지 표로, 일관성 경고.

### T10 — 역번역 트레이닝
- `/api/backtranslate/new`·`/score`, `/backtranslate` 화면, `FidelityGauge`
- **Done when:** 의도 제시→영어 입력→역번역+일치도+소실뉘앙스+모범, DB 적재.

### T11 — 약점 리포트
- `/api/weakness`, `/weakness` 화면, 랭킹·추이·맞춤 드릴
- **Done when:** 누적 오류가 유형별 랭킹+추이로, 드릴 추천 동작.

### T12 — 온보딩 진단
- `/onboarding` 3글 입력→추정 CEFR+최약점→profiles 업데이트
- **Done when:** 신규 가입 후 진단 완료 시 대시보드에 베이스라인 표시.

### T13 — 대시보드 통합
- 오늘의 과제·streak·점수 추이 미니차트·최근 작문·DEEPREAD 딥링크
- **Done when:** 핵심 지표가 한 화면에.

### T14 — 결제 게이트 (Pro)
- 토스페이먼츠(또는 Stripe), plan 컬럼 갱신, 게이트 일괄 적용
- **Done when:** Free↔Pro 전환 시 §3-b·§4·§2 접근 권한 변동.

### T15 — 배포 + QA
- Vercel 프로젝트(별도), 환경변수, 전체 여정 점검(가입→진단→작문→힌트→3톤→역번역→약점)
- **Done when:** 배포 URL에서 MVP 정의(00 README)가 모두 동작.

---
## 의존성
T01→T02→T03→T04 (기반) → T05→T06 (핵심) → T07~T13 (병렬 가능) → T14→T15.
**가장 먼저 가치 검증:** T06까지 끝나면 핵심 경험이 동작하니, 거기서 한 번 사용자 피드백.
