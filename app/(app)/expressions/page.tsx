import {
  ExpressionList,
  type SavedExpression,
} from "@/components/expressions/ExpressionList";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// 어휘장 (저장한 어휘 카드 + 네이티브 표현 모음). deepread 단어장형.
export default async function ExpressionsPage() {
  let items: SavedExpression[] = [];

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // select("*") — vocab/headword 컬럼(0006) 미적용 환경에서도 안전.
      const { data } = await supabase
        .from("saved_expressions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      items = (data ?? []) as SavedExpression[];
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">어휘장</h1>
        <p className="mt-1 text-sm text-soft">
          진단에서 담은 단어·표현을 콜로케이션·유의어·반의어와 함께 모아 복습해요.
        </p>
      </div>
      <ExpressionList items={items} />
    </div>
  );
}
