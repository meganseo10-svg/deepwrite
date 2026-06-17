import {
  ExpressionList,
  type SavedExpression,
} from "@/components/expressions/ExpressionList";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// 표현장 (저장한 네이티브 표현 모음). deepread 모방 훈련 소스.
export default async function ExpressionsPage() {
  let items: SavedExpression[] = [];

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("saved_expressions")
        .select("id, expression, note, from_deepread, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      items = (data ?? []) as SavedExpression[];
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">표현장</h1>
        <p className="mt-1 text-sm text-soft">
          저장한 네이티브 표현을 모아 다시 써보며 익혀요.
        </p>
      </div>
      <ExpressionList items={items} />
    </div>
  );
}
