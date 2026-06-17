import { describe, it, expect } from "vitest";
import { avgScore, scoreDimLabel, weaknessLabel } from "./constants";

describe("avgScore", () => {
  it("동일 점수의 평균", () => {
    expect(
      avgScore({ lexis: 80, collocation: 80, structure: 80, cohesion: 80, tone: 80 }),
    ).toBe(80);
  });
  it("혼합 점수 평균", () => {
    expect(
      avgScore({ lexis: 70, collocation: 80, structure: 90, cohesion: 60, tone: 100 }),
    ).toBe(80);
  });
  it("반올림", () => {
    expect(
      avgScore({ lexis: 70, collocation: 70, structure: 70, cohesion: 70, tone: 71 }),
    ).toBe(70); // 351/5 = 70.2 → 70
  });
});

describe("scoreDimLabel", () => {
  it("정의된 차원은 한글 라벨", () => {
    expect(scoreDimLabel("tone")).toBe("톤 일치");
    expect(scoreDimLabel("lexis")).toBe("어휘");
  });
  it("미정의는 원문 폴백", () => {
    expect(scoreDimLabel("unknown_dim")).toBe("unknown_dim");
  });
});

describe("weaknessLabel", () => {
  it("정의된 유형은 한글 라벨", () => {
    expect(weaknessLabel("article")).toBe("관사");
    expect(weaknessLabel("run_on")).toBe("run-on(접속)");
  });
  it("미정의는 원문 폴백", () => {
    expect(weaknessLabel("some_new_category")).toBe("some_new_category");
  });
});
