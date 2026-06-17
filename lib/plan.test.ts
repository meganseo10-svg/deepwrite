import { describe, it, expect } from "vitest";
import { isProPlan } from "./plan";

describe("isProPlan", () => {
  it("pro/master/business 는 Pro", () => {
    expect(isProPlan("pro")).toBe(true);
    expect(isProPlan("master")).toBe(true);
    expect(isProPlan("business")).toBe(true);
  });
  it("free/basic 는 비Pro", () => {
    expect(isProPlan("free")).toBe(false);
    expect(isProPlan("basic")).toBe(false);
  });
  it("null/undefined/빈값은 비Pro", () => {
    expect(isProPlan(null)).toBe(false);
    expect(isProPlan(undefined)).toBe(false);
    expect(isProPlan("")).toBe(false);
  });
});
