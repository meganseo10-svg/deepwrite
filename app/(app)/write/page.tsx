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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">작문하기</h1>
        <p className="mt-1 text-sm leading-relaxed text-soft">
          쓰고 싶은 내용을 <span className="font-medium text-ink">자유롭게 영어로</span>{" "}
          쓰면, 5차원 진단과 격식·중립·구어 3톤 리라이트를 드려요. 정해진 한국어 문장을
          영어로 옮기는 연습은 <span className="font-medium text-ink">역번역</span>{" "}
          탭에 있어요.
        </p>
      </div>
      <Editor
        initialTone={tone}
        initialHintMode={hintMode}
        canSave={canSave}
        isPro={isPro}
      />
    </div>
  );
}
