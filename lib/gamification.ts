// 게이미피케이션 — 레벨·XP·업적 계산 (순수, DB/LLM 무관 → 단위 테스트 가능).
// 데이터: 작문 수·연속일(streak)·저장 어휘 수·역번역 수.

export type GamiStats = {
  writings: number;
  streak: number;
  vocab: number;
  backtrans: number;
};

// 레벨은 작문 수 기준(가장 직관적). 작가 성장 서사.
export const LEVELS = [
  { min: 0, title: "첫 문장", emoji: "🌱" },
  { min: 3, title: "습작가", emoji: "✍️" },
  { min: 10, title: "꾸준한 작가", emoji: "📒" },
  { min: 30, title: "능숙한 작가", emoji: "🖋️" },
  { min: 100, title: "문장 장인", emoji: "🏆" },
] as const;

// 활동 점수(XP): 작문·어휘·역번역 가중 합. 표시용 보조 지표.
export function xpOf(s: GamiStats): number {
  return s.writings * 10 + s.vocab * 2 + s.backtrans * 5;
}

export type LevelInfo = {
  level: number; // 1-based
  title: string;
  emoji: string;
  progress: number; // 다음 레벨까지 0~100 (최고 레벨은 100)
  toNext: number; // 다음 레벨까지 남은 작문 수 (최고 레벨은 0)
  isMax: boolean;
};

export function computeLevel(writings: number): LevelInfo {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (writings >= LEVELS[i].min) idx = i;
  }
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  if (!next) {
    return { level: idx + 1, title: cur.title, emoji: cur.emoji, progress: 100, toNext: 0, isMax: true };
  }
  const span = next.min - cur.min;
  const progress = Math.max(0, Math.min(100, Math.round(((writings - cur.min) / span) * 100)));
  return {
    level: idx + 1,
    title: cur.title,
    emoji: cur.emoji,
    progress,
    toNext: Math.max(0, next.min - writings),
    isMax: false,
  };
}

export type Achievement = {
  key: string;
  label: string;
  emoji: string;
  desc: string;
  earned: boolean;
};

export function achievements(s: GamiStats): Achievement[] {
  return [
    { key: "first", label: "첫 작문", emoji: "🎉", desc: "첫 글을 진단받았어요", earned: s.writings >= 1 },
    { key: "streak3", label: "불꽃", emoji: "🔥", desc: "3일 연속 작성", earned: s.streak >= 3 },
    { key: "streak7", label: "한 주 완주", emoji: "🗓️", desc: "7일 연속 작성", earned: s.streak >= 7 },
    { key: "prolific", label: "다작가", emoji: "📚", desc: "작문 30편 달성", earned: s.writings >= 30 },
    { key: "vocab20", label: "어휘 수집가", emoji: "🗂️", desc: "어휘 20개 저장", earned: s.vocab >= 20 },
    { key: "backtrans5", label: "역번역러", emoji: "🔁", desc: "역번역 5회 완료", earned: s.backtrans >= 5 },
  ];
}
