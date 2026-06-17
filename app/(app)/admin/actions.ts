"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

const PLANS = ["free", "basic", "pro", "master", "business"] as const;

// 관리자 전용: 사용자 요금제 변경 (결제 없이 게이트 테스트용).
// 호출자가 관리자임을 서버에서 재검증한 뒤 service-role 로 갱신.
export async function setUserPlan(userId: string, plan: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return { error: "forbidden" as const };
  if (!(PLANS as readonly string[]).includes(plan))
    return { error: "invalid plan" as const };

  const sb = createAdminClient();
  const { error } = await sb
    .from("profiles")
    .update({ plan })
    .eq("id", userId);
  if (error) return { error: error.message };
  return { ok: true as const };
}
