// 요금제 게이트 헬퍼.
// PRD 5: free < basic < pro < master, business(팀). 'pro+' 게이트 = pro/master/business.
import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export const PRO_PLANS = ["pro", "master", "business"] as const;

export function isProPlan(plan: string | null | undefined): boolean {
  return !!plan && (PRO_PLANS as readonly string[]).includes(plan);
}

// 프로필 플랜 조회(미설정=free). Pro 게이트 라우트들의 중복 제거용.
export async function getPlan(
  supabase: SupabaseServer,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  return data?.plan ?? "free";
}

export async function isUserPro(
  supabase: SupabaseServer,
  userId: string,
): Promise<boolean> {
  return isProPlan(await getPlan(supabase, userId));
}
