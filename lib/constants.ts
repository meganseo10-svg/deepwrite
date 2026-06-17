// UI/도메인 공용 상수.

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

export const HINT_MODE_OPTIONS = [
  { value: "instant", label: "즉시 힌트" },
  { value: "after_try", label: "시도 후 힌트" },
  { value: "off", label: "끄기(시험)" },
] as const;
export type HintMode = (typeof HINT_MODE_OPTIONS)[number]["value"];
