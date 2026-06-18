"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { weaknessLabel } from "@/lib/constants";
import type { Onboarding } from "@/lib/schemas/llm";

// 장르·톤이 다른 3개 과제 — 5차원 베이스라인을 폭넓게 잡기 위함.
const PROMPTS = [
  {
    genre: "이메일",
    tone: "격식체",
    hint: "예: 거래처에 회의 일정 변경을 정중히 요청하는 짧은 이메일",
  },
  {
    genre: "의견 에세이",
    tone: "중립",
    hint: "예: 재택근무의 장단점에 대한 자신의 의견 3~4문장",
  },
  {
    genre: "메신저",
    tone: "구어",
    hint: "예: 친구에게 주말 계획을 제안하는 캐주얼한 메시지",
  },
] as const;

export function OnboardingFlow() {
  const [texts, setTexts] = useState<string[]>(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Onboarding | null>(null);

  const allFilled = texts.every((t) => t.trim().length > 0);

  function setText(i: number, v: string) {
    setTexts((prev) => prev.map((t, idx) => (idx === i ? v : t)));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: texts.map((t) => t.trim()) }),
      });
      const data = await res.json();
      if (res.ok) setResult(data as Onboarding);
      else setError(data?.error?.message ?? "진단에 실패했습니다.");
    } catch {
      setError("네트워크 오류로 진단에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-ink">진단 완료</h1>
        <Card>
          <CardBody className="space-y-5 pt-6 text-center">
            <div>
              <div className="text-xs font-medium text-faint">추정 CEFR</div>
              <div className="mt-1 text-5xl font-bold text-brand">
                {result.estimated_cefr}
              </div>
            </div>

            {result.top_weakness.length > 0 && (
              <div>
                <div className="text-xs font-medium text-faint">
                  지금 가장 보완할 점
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {result.top_weakness.map((w, i) => (
                    <span
                      key={i}
                      className="rounded-badge bg-gold/10 px-3 py-1 text-sm font-medium text-gold"
                    >
                      {weaknessLabel(w)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-soft">
              이 베이스라인을 기준으로 작문·약점 추적이 시작됩니다.
            </p>

            <div className="flex justify-center gap-2 pt-1">
              <Link href="/dashboard" className={buttonClass()}>
                대시보드로
              </Link>
              <Link href="/write" className={buttonClass({ variant: "secondary" })}>
                바로 작문하기
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">온보딩 진단</h1>
        <p className="mt-1 text-sm text-soft">
          장르·톤이 다른 짧은 글 3개를 써 주세요. 5차원으로 분석해 추정 CEFR과
          최약점을 알려 드립니다.
        </p>
      </div>

      {PROMPTS.map((p, i) => (
        <Card key={i}>
          <CardBody className="space-y-2 pt-5">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-ink">글 {i + 1}</span>
              <span className="rounded-badge bg-paper2 px-2 py-0.5 text-xs text-soft">
                {p.genre} · {p.tone}
              </span>
            </div>
            <p className="text-xs text-faint">{p.hint}</p>
            <textarea
              value={texts[i]}
              onChange={(e) => setText(i, e.target.value)}
              placeholder="여기에 영어로 작성하세요."
              className="min-h-28 w-full resize-y rounded-btn border border-line2 bg-paper2 p-3 text-[15px] leading-relaxed text-ink outline-none focus:border-ox focus:ring-2 focus:ring-ox/30"
            />
          </CardBody>
        </Card>
      ))}

      {error && <p className="text-sm text-gold">{error}</p>}

      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-faint hover:text-soft">
          나중에 하기
        </Link>
        <Button disabled={!allFilled || submitting} onClick={submit}>
          {submitting ? "진단 중…" : "진단받기"}
        </Button>
      </div>
    </div>
  );
}
