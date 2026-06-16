// UI/도메인 공용 상수.

export const TONE_OPTIONS = [
  { value: "formal", label: "격식체" },
  { value: "neutral", label: "중립" },
  { value: "casual", label: "구어" },
] as const;
export type Tone = (typeof TONE_OPTIONS)[number]["value"];

export const HINT_MODE_OPTIONS = [
  { value: "instant", label: "즉시 힌트" },
  { value: "after_try", label: "시도 후 힌트" },
  { value: "off", label: "끄기(시험)" },
] as const;
export type HintMode = (typeof HINT_MODE_OPTIONS)[number]["value"];
