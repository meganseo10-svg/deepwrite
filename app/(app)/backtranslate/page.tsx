import { BacktranslateTrainer } from "@/components/backtranslate/BacktranslateTrainer";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/plan";

// 역번역 트레이닝 (T10). 채점 Pro 게이트 여부를 프로필에서 읽어 전달.
export default async function BacktranslatePage() {
  let isPro = false;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      isPro = isProPlan(data?.plan);
    }
  }

  return <BacktranslateTrainer isPro={isPro} />;
}
