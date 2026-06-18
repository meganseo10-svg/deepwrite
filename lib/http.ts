import { NextResponse } from "next/server";

// 05 공통 에러 포맷.
export type ApiErrCode =
  | "UNAUTHENTICATED"
  | "INVALID_INPUT"
  | "RATE_LIMIT"
  | "PLAN_REQUIRED"
  | "LLM_FAIL"
  | "BILLING_FAIL";

export function apiError(code: ApiErrCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
