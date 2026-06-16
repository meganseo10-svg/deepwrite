# 05. API SPEC — DEEPWRITE 라우트

> 모든 라우트: Next.js App Router `app/api/*/route.ts`. 입력은 Zod 검증.
> 인증: Supabase 세션 필수(라우트에서 `getUser()`). 플랜 게이트는 각 라우트에서 확인.

## POST /api/analyze  — 5차원 진단 + 리라이트
```
Body:  { text: string, tone: "formal"|"neutral"|"casual", genre?: string }
Auth:  필수
Plan:  free=일 3회 / basic+=무제한
Flow:  캐시확인 → 04§1 호출(스트리밍) → writings insert → weaknesses → weakness_events insert
Res:   { writingId, scores, rewrite, diff, explanations }  (스트리밍: rewrite 토큰 → 마지막에 JSON)
```

## POST /api/tone  — 3톤 변환
```
Body:  { text: string }
Plan:  pro+ (free/basic는 미리보기 1회/일)
Res:   { versions, drivers, consistency_tip }      // 04§2
```

## POST /api/tone/consistency  — 톤 일관성 검사
```
Body:  { text: string }
Res:   { main_tone, outliers }
```

## POST /api/hint/collocation  — 콜로케이션 힌트 (경량·저지연)
```
Body:  { headword: string, tone: string }
Cache: sha256(headword+tone)
Res:   { headword, collocations, warnings }         // 04§3-a
```

## POST /api/hint/compare  — 비교 단어 카드
```
Body:  { word: string }
Plan:  pro+ (게이트)
Cache: sha256(word)
Res:   { word, near_synonyms, antonyms }             // 04§3-b
```

## POST /api/backtranslate/new  — 역번역 과제 생성
```
Body:  { cefr?: string, genre?: string }
Res:   { intent_ko }
```

## POST /api/backtranslate/score  — 역번역 채점
```
Body:  { intentKo: string, userEn: string }
Plan:  pro+
Flow:  04§4-b 호출 → backtranslations insert
Res:   { back_ko, fidelity, gaps, model_answer }
```

## GET /api/weakness  — 약점 리포트
```
Res:   { ranking: [{category, cnt, trendPct}], drillSuggestion: {category, items:[...]} }
Flow:  weakness_summary 뷰 + 최근/이전 기간 비교로 trendPct 계산
```

## POST /api/onboarding  — 진단
```
Body:  { texts: string[3] }
Res:   { estimated_cefr, top_weakness: [...] }       // profiles 업데이트
```

## GET /api/writings  — 내 작문 목록 / GET /api/writings/[id] — 상세

## 공통 에러 포맷
```
{ error: { code: "RATE_LIMIT"|"PLAN_REQUIRED"|"LLM_FAIL"|"INVALID_INPUT", message: string } }
```
