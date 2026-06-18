import { describe, it, expect } from "vitest";
import { computeLevel, xpOf, achievements, LEVELS } from "./gamification";

describe("computeLevel", () => {
  it("작문 0편 → Lv.1 첫 문장", () => {
    const l = computeLevel(0);
    expect(l.level).toBe(1);
    expect(l.title).toBe("첫 문장");
    expect(l.isMax).toBe(false);
  });

  it("경계값에서 레벨 상승", () => {
    expect(computeLevel(2).level).toBe(1);
    expect(computeLevel(3).level).toBe(2); // 습작가
    expect(computeLevel(10).level).toBe(3);
    expect(computeLevel(30).level).toBe(4);
    expect(computeLevel(100).level).toBe(5);
  });

  it("다음 레벨까지 진행률·잔여", () => {
    // Lv.2 구간 [3,10): 6편이면 (6-3)/(10-3)=42.8→43%, 남은 4편
    const l = computeLevel(6);
    expect(l.progress).toBe(43);
    expect(l.toNext).toBe(4);
  });

  it("최고 레벨은 progress 100, isMax true", () => {
    const l = computeLevel(250);
    expect(l.level).toBe(LEVELS.length);
    expect(l.isMax).toBe(true);
    expect(l.progress).toBe(100);
    expect(l.toNext).toBe(0);
  });
});

describe("xpOf", () => {
  it("가중 합", () => {
    expect(xpOf({ writings: 3, vocab: 5, backtrans: 2 })).toBe(3 * 10 + 5 * 2 + 2 * 5);
  });
});

describe("achievements", () => {
  it("무활동 → 전부 미획득", () => {
    const a = achievements({ writings: 0, streak: 0, vocab: 0, backtrans: 0 });
    expect(a.every((x) => !x.earned)).toBe(true);
  });

  it("조건 충족분만 획득", () => {
    const a = achievements({ writings: 30, streak: 7, vocab: 20, backtrans: 5 });
    expect(a.every((x) => x.earned)).toBe(true);
  });

  it("부분 충족", () => {
    const a = achievements({ writings: 1, streak: 3, vocab: 0, backtrans: 0 });
    const earned = a.filter((x) => x.earned).map((x) => x.key);
    expect(earned).toContain("first");
    expect(earned).toContain("streak3");
    expect(earned).not.toContain("streak7");
    expect(earned).not.toContain("vocab20");
  });
});
