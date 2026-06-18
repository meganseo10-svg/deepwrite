import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/http";
import { PLAN_INFO, isPurchasablePlan } from "@/lib/constants";
import { issueBillingKey, chargeBilling, isTossConfigured, TossError } from "@/lib/toss";

const BodySchema = z.object({
  plan: z.string(),
  customerKey: z.string().min(2).max(50),
  authKey: z.string().min(1),
});

// 토스 빌링: authKey → 빌링키 발급 + 첫 결제 승인 + 구독 기록 + plan 부여.
export async function POST(request: Request) {
  if (!isTossConfigured)
    return apiError("BILLING_FAIL", "결제가 아직 설정되지 않았습니다.", 503);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHENTICATED", "로그인이 필요합니다.", 401);

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError("INVALID_INPUT", "요청 형식이 올바르지 않습니다.", 400);

  const { plan, customerKey, authKey } = parsed.data;
  if (!isPurchasablePlan(plan))
    return apiError("INVALID_INPUT", "구매할 수 없는 요금제입니다.", 400);
  // 보안: customerKey 는 반드시 본인 식별자(user.id)여야 함.
  if (customerKey !== user.id)
    return apiError("INVALID_INPUT", "결제 정보가 일치하지 않습니다.", 400);

  const info = PLAN_INFO[plan];
  const orderId = `${plan}_${user.id}_${crypto.randomUUID()}`.slice(0, 64);

  let billingKey: string;
  try {
    ({ billingKey } = await issueBillingKey(authKey, customerKey));
    await chargeBilling(billingKey, {
      customerKey,
      amount: info.amount,
      orderId,
      orderName: `DEEPWRITE ${info.name} 구독`,
    });
  } catch (e: unknown) {
    const msg = e instanceof TossError ? e.message : "결제 처리에 실패했습니다.";
    return apiError("BILLING_FAIL", msg, 502);
  }

  // 결제 성공 → service_role 로 기록(RLS 쓰기 차단되어 admin 클라이언트 사용).
  const sb = createAdminClient();
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // 기존 활성 구독은 정리(교체).
  await sb
    .from("subscriptions")
    .update({ status: "canceled", canceled_at: now.toISOString() })
    .eq("user_id", user.id)
    .eq("status", "active");

  const { error: insErr } = await sb.from("subscriptions").insert({
    user_id: user.id,
    plan,
    status: "active",
    billing_key: billingKey,
    customer_key: customerKey,
    amount: info.amount,
    started_at: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    last_payment_at: now.toISOString(),
  });
  if (insErr) return apiError("BILLING_FAIL", "구독 기록에 실패했습니다.", 500);

  const { error: planErr } = await sb
    .from("profiles")
    .update({ plan })
    .eq("id", user.id);
  if (planErr) return apiError("BILLING_FAIL", "요금제 적용에 실패했습니다.", 500);

  return NextResponse.json({ ok: true, plan });
}
