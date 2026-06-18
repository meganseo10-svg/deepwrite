"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { VocabCard } from "@/components/editor/VocabCard";
import { deleteExpression } from "@/app/(app)/write/actions";
import type { Vocab } from "@/lib/schemas/llm";

export type SavedExpression = {
  id: string;
  expression: string;
  note: string | null;
  from_deepread: boolean;
  created_at: string;
  headword?: string | null;
  vocab?: Vocab | null;
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export function ExpressionList({ items }: { items: SavedExpression[] }) {
  const [list, setList] = useState(items);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function remove(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const res = await deleteExpression(id);
      if ("ok" in res) setList((prev) => prev.filter((e) => e.id !== id));
      setPendingId(null);
    });
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardBody className="rounded-btn px-4 py-10 text-center text-sm text-faint">
          아직 담은 어휘가 없어요. 작문 진단 결과의 <b>어휘 카드</b>에서 “＋ 어휘장”으로
          단어·표현을 하나씩 모아보세요.
        </CardBody>
      </Card>
    );
  }

  const delBtn = (id: string) => (
    <button
      type="button"
      onClick={() => remove(id)}
      disabled={pendingId === id}
      className="shrink-0 rounded-badge px-2 py-1 text-xs text-faint hover:bg-paper2 hover:text-gold disabled:opacity-50"
      aria-label="삭제"
    >
      {pendingId === id ? "삭제 중…" : "삭제"}
    </button>
  );

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {list.map((e) => (
        <li key={e.id}>
          {e.vocab ? (
            <VocabCard item={e.vocab} action={delBtn(e.id)} />
          ) : (
            <Card>
              <CardBody className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-relaxed text-ink">
                    {e.expression}
                  </p>
                  {e.note && <p className="mt-1 text-xs text-soft">{e.note}</p>}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs text-faint">
                      {fmtDate(e.created_at)}
                    </span>
                    {e.from_deepread && <Badge tone="ox">DEEPREAD</Badge>}
                  </div>
                </div>
                {delBtn(e.id)}
              </CardBody>
            </Card>
          )}
        </li>
      ))}
    </ul>
  );
}
