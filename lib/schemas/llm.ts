import { z } from "zod";

// 04_LLM_PROMPTS.md 의 출력 JSON 에 1:1 대응하는 Zod 스키마.
// 점수는 0~100 정수. register/dimension 등은 모델 변형을 허용해 string 으로 둠.

const score = z.number().int().min(0).max(100);

export const TONES = ["formal", "neutral", "casual"] as const;
export const ToneEnum = z.enum(TONES);

// 요청 스키마 (POST /api/analyze)
export const AnalyzeRequestSchema = z.object({
  text: z.string().min(1).max(8000),
  tone: ToneEnum,
  genre: z.string().optional(),
});

// ── §1. 5차원 진단 + 네이티브 리라이트 ──
export const ScoresSchema = z.object({
  lexis: score,
  collocation: score,
  structure: score,
  cohesion: score,
  tone: score,
});

export const DiffOpSchema = z.object({
  op: z.enum(["keep", "insert", "delete", "replace"]),
  before: z.string().optional(),
  after: z.string().optional(),
});

export const ExplanationSchema = z.object({
  before: z.string(),
  after: z.string(),
  dimension: z.string(), // lexis | collocation | structure | cohesion | tone
  reason: z.string(),
  rule: z.string(),
  frequency: z.string(),
});

export const WeaknessSchema = z.object({
  category: z.string(), // article | collocation | tense | preposition | run_on | ...
  detail: z.string(),
  example: z.string(),
});

export const AnalyzeSchema = z.object({
  scores: ScoresSchema,
  rewrite: z.string(),
  diff: z.array(DiffOpSchema),
  explanations: z.array(ExplanationSchema),
  weaknesses: z.array(WeaknessSchema),
});

// ── §2. 3톤 동시 변환 ──
export const ToneVersionsSchema = z.object({
  formal: z.string(),
  neutral: z.string(),
  casual: z.string(),
});

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

// ── §4. 역번역 ──
export const BacktransNewSchema = z.object({ intent_ko: z.string() });

export const BacktransScoreSchema = z.object({
  back_ko: z.string(),
  fidelity: z.number().int().min(0).max(100),
  gaps: z.array(z.object({ intended: z.string(), lost: z.string() })),
  model_answer: z.string(),
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
