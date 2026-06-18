// UI/도메인 공용 상수.

// 자매 앱 deepread 딥링크 (헤더·대시보드·랜딩 공용). env 우선, 없으면 배포 URL 폴백.
export const DEEPREAD_URL =
  process.env.NEXT_PUBLIC_DEEPREAD_URL ??
  "https://deepread-meganseo10-9394s-projects.vercel.app/";

export const TONE_OPTIONS = [
  { value: "formal", label: "격식체" },
  { value: "neutral", label: "중립" },
  { value: "casual", label: "구어" },
] as const;
export type Tone = (typeof TONE_OPTIONS)[number]["value"];

// 약점 오류 유형 한글 라벨 (04 weaknesses.category / 03 weakness_events.category).
// 미정의 카테고리는 원문 그대로 표시(fallback).
export const WEAKNESS_LABELS: Record<string, string> = {
  article: "관사",
  collocation: "콜로케이션",
  tense: "시제",
  preposition: "전치사",
  run_on: "run-on(접속)",
  register: "격식·톤",
  word_choice: "어휘 선택",
  agreement: "수일치",
  punctuation: "구두점",
  spelling: "철자",
  word_order: "어순",
};

export function weaknessLabel(category: string): string {
  return WEAKNESS_LABELS[category] ?? category;
}

// 5차원 점수 라벨·순서 (04 §1). ScoreBars·ExplanationCard 공용 — 라벨 드리프트 방지.
export const SCORE_DIMS = [
  { key: "lexis", label: "어휘" },
  { key: "collocation", label: "콜로케이션" },
  { key: "structure", label: "문장 구조" },
  { key: "grammar", label: "문법" },
  { key: "tone", label: "톤" },
] as const;

export function scoreDimLabel(key: string): string {
  return SCORE_DIMS.find((d) => d.key === key)?.label ?? key;
}

type ScoreSet = {
  lexis: number;
  collocation: number;
  structure: number;
  grammar: number;
  tone: number;
};

// 5차원 평균(0~100 정수). ScoreBars·dashboard 공용.
export function avgScore(s: ScoreSet): number {
  const v = [s.lexis, s.collocation, s.structure, s.grammar, s.tone];
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}

// 유료 플랜 정보 (요금제 페이지·결제 공용). amount = 원(KRW) 정수.
// self-serve 결제 대상은 개인 3플랜(Basic/Pro/Master). Business 는 인당 과금이라 문의.
export const PLAN_INFO: Record<string, { name: string; amount: number }> = {
  basic: { name: "Basic", amount: 9900 },
  pro: { name: "Pro", amount: 19900 },
  master: { name: "Master", amount: 39900 },
};

export const PURCHASABLE_PLANS = ["basic", "pro", "master"] as const;
export type PurchasablePlan = (typeof PURCHASABLE_PLANS)[number];

export function isPurchasablePlan(plan: string): plan is PurchasablePlan {
  return (PURCHASABLE_PLANS as readonly string[]).includes(plan);
}

export const HINT_MODE_OPTIONS = [
  { value: "instant", label: "즉시 힌트" },
  { value: "after_try", label: "시도 후 힌트" },
  { value: "off", label: "끄기(시험)" },
] as const;
export type HintMode = (typeof HINT_MODE_OPTIONS)[number]["value"];
