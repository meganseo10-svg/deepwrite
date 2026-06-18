import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { avgScore } from "@/lib/constants";

type ScoreSet = {
  lexis: number;
  collocation: number;
  structure: number;
  grammar: number;
  tone: number;
};

type Row = {
  id: string;
  created_at: string;
  genre: string | null;
  source_text: string;
  scores: ScoreSet | null;
};

const GENRE_LABEL: Record<string, string> = {
  email: "이메일",
  report: "리포트",
  essay: "에세이",
  academic: "학술",
  summary: "요약",
  free: "자유",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function WritingsPage() {
  let rows: Row[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("writings")
        .select("id, created_at, genre, source_text, scores")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      rows = (data ?? []) as Row[];
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">작문 기록</h1>
        <Link
          href="/write"
          className="rounded-badge bg-brand px-3 py-1.5 text-sm font-medium text-white"
        >
          새 작문
        </Link>
      </div>
      <p className="text-sm text-soft">
        지금까지 진단받은 작문이에요. 눌러서 그때의 교정·점수를 다시 볼 수 있어요.
      </p>

      {rows.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-faint">
            아직 진단받은 작문이 없어요.{" "}
            <Link href="/write" className="font-medium text-ox-dark hover:underline">
              첫 작문 시작하기 →
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map((w) => {
            const avg = w.scores ? avgScore(w.scores) : null;
            return (
              <Link key={w.id} href={`/writings/${w.id}`} className="block">
                <Card className="transition hover:border-ox/40">
                  <CardBody className="flex items-center gap-3 py-3">
                    <span className="w-20 shrink-0 text-xs text-faint">
                      {fmtDate(w.created_at)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">
                      {w.source_text.replace(/\s+/g, " ").slice(0, 100) || "—"}
                    </span>
                    {w.genre && (
                      <Badge tone="neutral" className="hidden shrink-0 sm:inline-flex">
                        {GENRE_LABEL[w.genre] ?? w.genre}
                      </Badge>
                    )}
                    {avg !== null && (
                      <span className="shrink-0 text-sm font-semibold text-brand">
                        {avg}
                      </span>
                    )}
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
