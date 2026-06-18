import { describe, it, expect } from "vitest";
import { kstDay, kstDayStartIso, computeStreak, trendPct } from "./metrics";

// 2026-06-17 03:00 UTC = 12:00 KST → 오늘(KST) = 2026-06-17
const NOW = Date.UTC(2026, 5, 17, 3, 0, 0);
const at = (ymd: string) => `${ymd}T01:00:00Z`; // +9h 해도 같은 날 (KST)

describe("kstDay", () => {
  it("UTC 시각을 KST 일자로 변환", () => {
    expect(kstDay("2026-06-16T01:00:00Z")).toBe("2026-06-16"); // +9h=10:00
    // 자정 경계: 16일 20시 UTC = 17일 05시 KST
    expect(kstDay("2026-06-16T20:00:00Z")).toBe("2026-06-17");
  });
});

describe("kstDayStartIso", () => {
  it("KST 자정에 해당하는 UTC instant 반환 (전날 15:00Z)", () => {
    // 2026-06-17 03:00 UTC(=12:00 KST) → KST 자정 = 2026-06-17 00:00 KST = 2026-06-16 15:00 UTC
    expect(kstDayStartIso(NOW)).toBe("2026-06-16T15:00:00.000Z");
  });
  it("KST 자정 직후/직전이 같은 일자 시작을 가리킴", () => {
    const justAfter = Date.UTC(2026, 5, 16, 15, 0, 1); // KST 00:00:01
    const justBefore = Date.UTC(2026, 5, 16, 14, 59, 59); // KST 23:59:59 전날
    expect(kstDayStartIso(justAfter)).toBe("2026-06-16T15:00:00.000Z");
    expect(kstDayStartIso(justBefore)).toBe("2026-06-15T15:00:00.000Z");
  });
});

describe("computeStreak", () => {
  it("기록 없으면 0", () => {
    expect(computeStreak([], NOW)).toBe(0);
  });

  it("오늘 하루만 → 1", () => {
    expect(computeStreak([at("2026-06-17")], NOW)).toBe(1);
  });

  it("연속 3일 → 3", () => {
    expect(
      computeStreak([at("2026-06-17"), at("2026-06-16"), at("2026-06-15")], NOW),
    ).toBe(3);
  });

  it("중간에 빠진 날이 있으면 끊김", () => {
    expect(computeStreak([at("2026-06-17"), at("2026-06-15")], NOW)).toBe(1);
  });

  it("오늘 없고 어제부터 연속이면 어제부터 카운트", () => {
    expect(
      computeStreak([at("2026-06-16"), at("2026-06-15")], NOW),
    ).toBe(2);
  });

  it("같은 날 여러 번 작성은 1일로 집계", () => {
    expect(
      computeStreak(["2026-06-17T01:00:00Z", "2026-06-17T05:00:00Z"], NOW),
    ).toBe(1);
  });

  it("이틀 넘게 비면 streak 0", () => {
    expect(computeStreak([at("2026-06-14")], NOW)).toBe(0);
  });
});

describe("trendPct", () => {
  it("둘 다 0 → 0", () => {
    expect(trendPct(0, 0)).toBe(0);
  });
  it("prior 0, recent>0 → 100 (신규/급증)", () => {
    expect(trendPct(3, 0)).toBe(100);
  });
  it("증가율 반올림", () => {
    expect(trendPct(5, 4)).toBe(25);
  });
  it("개선(감소)은 음수", () => {
    expect(trendPct(5, 10)).toBe(-50);
    expect(trendPct(0, 4)).toBe(-100);
  });
});
