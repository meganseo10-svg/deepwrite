import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/http";

// 구독 해지: 활성 구독을 canceled 로, plan 을 즉시 free 로.
// (MVP 결정: 즉시 다운그레이드 — 일할 환불 로직 없음. 빌링키는 보관하지 않고 무효화 표시.)
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHENTICATED", "로그인이 필요합니다.", 401);

  const sb = createAdminClient();
  const now = new Date().toISOString();

  const { error: subErr } = await sb
    .from("subscriptions")
    .update({ status: "canceled", canceled_at: now })
    .eq("user_id", user.id)
    .eq("status", "active");
  if (subErr) return apiError("BILLING_FAIL", "해지 처리에 실패했습니다.", 500);

  const { error: planErr } = await sb
    .from("profiles")
    .update({ plan: "free" })
    .eq("id", user.id);
  if (planErr) return apiError("BILLING_FAIL", "요금제 변경에 실패했습니다.", 500);

  return NextResponse.json({ ok: true });
}
