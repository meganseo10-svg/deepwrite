// 순수 지표 계산 — 서버/클라이언트 무관, DB·LLM 미사용이라 단위 테스트 가능.
// 날짜 일자 버킷은 한국 사용자 기준(KST, UTC+9, DST 없음)으로 통일.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// ISO 문자열 또는 epoch(ms) → KST 일자 'YYYY-MM-DD'
export function kstDay(at: string | number): string {
  const t = typeof at === "number" ? at : new Date(at).getTime();
  return new Date(t + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// 주어진 시각이 속한 KST 일자의 시작(KST 자정)에 해당하는 UTC instant(ISO).
// 무료 일일 게이트(진단 3회·미리보기 1회)를 KST 자정 기준으로 카운트할 때 사용
// — 서버(UTC) 자정으로 세면 한국 사용자 쿼터가 오전 9시에 리셋되는 문제 해소.
export function kstDayStartIso(nowMs: number = Date.now()): string {
  const kstMidnight = Math.floor((nowMs + KST_OFFSET_MS) / DAY_MS) * DAY_MS;
  return new Date(kstMidnight - KST_OFFSET_MS).toISOString();
}

// 연속 작성일: 오늘(작성 없으면 어제)부터 거꾸로 이어지는 KST 일자 수.
export function computeStreak(
  timestamps: string[],
  nowMs: number = Date.now(),
): number {
  const days = new Set(timestamps.map((t) => kstDay(t)));
  if (days.size === 0) return 0;
  let cursor = nowMs;
  // 오늘 작성이 없으면 어제부터 카운트(연속성 유지)
  if (!days.has(kstDay(cursor))) cursor -= DAY_MS;
  let streak = 0;
  while (days.has(kstDay(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

// 추이(%): 지난 기간(prior) 대비 최근(recent) 변화. 음수=개선(오류 감소).
// prior=0 & recent>0 → 100(신규/급증), 둘 다 0 → 0.
export function trendPct(recent: number, prior: number): number {
  if (prior === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - prior) / prior) * 100);
}
