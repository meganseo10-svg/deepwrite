import { Editor } from "@/components/editor/Editor";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/plan";
import type { HintMode, Tone } from "@/lib/constants";

// 톤·힌트모드 기본값 + 플랜을 프로필에서 불러와 에디터 초기값으로 전달.
export default async function WritePage() {
  let tone: Tone = "neutral";
  let hintMode: HintMode = "after_try";
  let canSave = false;
  let isPro = false;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      canSave = true;
      const { data } = await supabase
        .from("profiles")
        .select("default_tone, hint_mode, plan")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        tone = data.default_tone as Tone;
        hintMode = data.hint_mode as HintMode;
        isPro = isProPlan(data.plan);
      }
    }
  }

  return (
    <Editor
      initialTone={tone}
      initialHintMode={hintMode}
      canSave={canSave}
      isPro={isPro}
    />
  );
}
