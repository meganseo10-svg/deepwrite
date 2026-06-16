// 요금제 게이트 헬퍼.
// PRD 5: free < basic < pro < master, business(팀). 'pro+' 게이트 = pro/master/business.
export const PRO_PLANS = ["pro", "master", "business"] as const;

export function isProPlan(plan: string | null | undefined): boolean {
  return !!plan && (PRO_PLANS as readonly string[]).includes(plan);
}
