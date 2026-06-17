"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { deleteExpression } from "@/app/(app)/write/actions";

export type SavedExpression = {
  id: string;
  expression: string;
  note: string | null;
  from_deepread: boolean;
  created_at: string;
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
          아직 저장한 표현이 없어요. 작문 진단 결과의 네이티브 리라이트를 “표현
          저장”으로 모아보세요.
        </CardBody>
      </Card>
    );
  }

  return (
    <ul className="space-y-2">
      {list.map((e) => (
        <li key={e.id}>
          <Card>
            <CardBody className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-relaxed text-ink">
                  {e.expression}
                </p>
                {e.note && (
                  <p className="mt-1 text-xs text-soft">{e.note}</p>
                )}
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-faint">
                    {fmtDate(e.created_at)}
                  </span>
                  {e.from_deepread && <Badge tone="ox">DEEPREAD</Badge>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(e.id)}
                disabled={pendingId === e.id}
                className="shrink-0 rounded-badge px-2 py-1 text-xs text-faint hover:bg-paper2 hover:text-gold disabled:opacity-50"
                aria-label="삭제"
              >
                {pendingId === e.id ? "삭제 중…" : "삭제"}
              </button>
            </CardBody>
          </Card>
        </li>
      ))}
    </ul>
  );
}
