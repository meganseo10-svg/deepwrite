import { z } from "zod";

// 04_LLM_PROMPTS.md 의 출력 JSON 에 1:1 대응하는 Zod 스키마.
// 점수는 0~100 정수. register/dimension 등은 모델 변형을 허용해 string 으로 둠.

const score = z.number().int().min(0).max(100);

export const TONES = ["formal", "neutral", "casual"] as const;
export const ToneEnum = z.enum(TONES);

// 요청 스키마 (POST /api/analyze) — 톤 선택 없이 작문, 피드백에서 3톤 제공
export const AnalyzeRequestSchema = z.object({
  text: z.string().min(1).max(8000),
  genre: z.string().optional(),
});

// ── §1. 5차원 진단 + 3톤 네이티브 리라이트 ──
export const ScoresSchema = z.object({
  lexis: score,
  collocation: score,
  structure: score,
  grammar: score,
  tone: score, // 말투의 일관성·자연스러움 (목표 대비 아님)
});

export const DiffOpSchema = z.object({
  op: z.enum(["keep", "insert", "delete", "replace"]),
  before: z.string().optional(),
  after: z.string().optional(),
});

export const ExplanationSchema = z.object({
  before: z.string(),
  after: z.string(),
  dimension: z.string(), // lexis | collocation | structure | grammar | tone
  reason: z.string(),
  rule: z.string(),
  frequency: z.string(),
});

export const WeaknessSchema = z.object({
  category: z.string(), // article | collocation | tense | preposition | run_on | ...
  detail: z.string(),
  example: z.string(),
});

// 3톤 버전 (격식/중립/구어) — §1 리라이트와 §2 변환에서 공용.
export const ToneVersionsSchema = z.object({
  formal: z.string(),
  neutral: z.string(),
  casual: z.string(),
});

// rewrites: 격식·중립·구어 3톤 (의미 동일). diff/explanations 는 neutral 기준.
export const AnalyzeSchema = z.object({
  scores: ScoresSchema,
  rewrites: ToneVersionsSchema,
  diff: z.array(DiffOpSchema),
  explanations: z.array(ExplanationSchema),
  weaknesses: z.array(WeaknessSchema),
});

// 요청 스키마 (POST /api/tone) — 문장 또는 짧은 단락
export const ToneRequestSchema = z.object({
  text: z.string().min(1).max(2000),
});

// 요청 스키마 (POST /api/tone/consistency) — 글 전체
export const ConsistencyRequestSchema = z.object({
  text: z.string().min(1).max(8000),
});

// ── §2. 3톤 동시 변환 (ToneVersionsSchema 는 위에서 정의·공용) ──
export const ToneDriverSchema = z.object({
  aspect: z.string(),
  formal: z.string(),
  neutral: z.string(),
  casual: z.string(),
  note: z.string(),
});

export const ToneSchema = z.object({
  versions: ToneVersionsSchema,
  drivers: z.array(ToneDriverSchema),
  consistency_tip: z.string(),
});

// 톤 일관성 검사
export const ConsistencySchema = z.object({
  main_tone: ToneEnum,
  outliers: z.array(
    z.object({
      sentence: z.string(),
      detected: z.string(),
      fix: z.string(),
    }),
  ),
});

// 요청 스키마 (POST /api/hint/collocation)
export const CollocationRequestSchema = z.object({
  headword: z.string().min(1).max(40),
  tone: ToneEnum,
});

// ── §3-a. 콜로케이션 힌트 ──
export const CollocationSchema = z.object({
  headword: z.string(),
  collocations: z.array(
    z.object({
      phrase: z.string(),
      register: z.string(),
      freq: z.number().int().min(0).max(5),
    }),
  ),
  warnings: z.array(z.object({ wrong: z.string(), why: z.string() })),
});

// 요청 스키마 (POST /api/hint/compare)
export const CompareRequestSchema = z.object({
  word: z.string().min(1).max(40),
});

// ── §3-b. 비교 단어 카드 ──
export const CompareSchema = z.object({
  word: z.string(),
  near_synonyms: z.array(
    z.object({
      word: z.string(),
      register: z.string(),
      intensity: z.number().int().min(1).max(5),
      nuance: z.string(),
      collocation: z.string(),
    }),
  ),
  antonyms: z.array(z.string()),
});

// 요청 스키마 (POST /api/backtranslate/new)
export const BacktransNewRequestSchema = z.object({
  cefr: z.string().max(10).optional(),
  genre: z.string().max(40).optional(),
});

// 요청 스키마 (POST /api/backtranslate/score)
export const BacktransScoreRequestSchema = z.object({
  intentKo: z.string().min(1).max(2000),
  userEn: z.string().min(1).max(4000),
});

// ── §4. 역번역 ──
export const BacktransNewSchema = z.object({ intent_ko: z.string() });

export const BacktransScoreSchema = z.object({
  back_ko: z.string(),
  fidelity: z.number().int().min(0).max(100),
  gaps: z.array(z.object({ intended: z.string(), lost: z.string() })),
  model_answer: z.string(),
});

// 요청 스키마 (POST /api/onboarding) — 짧은 글 정확히 3개
export const OnboardingRequestSchema = z.object({
  texts: z.array(z.string().trim().min(1).max(4000)).length(3),
});

// ── §5. 온보딩 진단 ──
export const OnboardingSchema = z.object({
  estimated_cefr: z.string(),
  top_weakness: z.array(z.string()),
});

// 추론 타입
export type Analyze = z.infer<typeof AnalyzeSchema>;
export type ToneResult = z.infer<typeof ToneSchema>;
export type Consistency = z.infer<typeof ConsistencySchema>;
export type Collocation = z.infer<typeof CollocationSchema>;
export type Compare = z.infer<typeof CompareSchema>;
export type BacktransNew = z.infer<typeof BacktransNewSchema>;
export type BacktransScore = z.infer<typeof BacktransScoreSchema>;
export type Onboarding = z.infer<typeof OnboardingSchema>;
export type Tone = (typeof TONES)[number];
