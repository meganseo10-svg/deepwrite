"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PlanLock } from "@/components/ui/PlanLock";
import { FidelityGauge } from "@/components/backtranslate/FidelityGauge";
import type { BacktransScore } from "@/lib/schemas/llm";

// 역번역 트레이닝 (06 화면3): 의도 카드 → 영어 입력 → 채점 결과 → 새 문제.
// 채점(score)은 Pro 전용 — free 는 의도 생성·작성은 가능하나 제출 시 PlanLock.
export function BacktranslateTrainer({ isPro }: { isPro: boolean }) {
  const [intentKo, setIntentKo] = useState<string | null>(null);
  const [intentLoading, setIntentLoading] = useState(true); // 마운트 시 자동 생성
  const [intentError, setIntentError] = useState<string | null>(null);

  const [userEn, setUserEn] = useState("");
  const [result, setResult] = useState<BacktransScore | null>(null);
  const [scoring, setScoring] = useState(false);
  const [locked, setLocked] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);

  // 과제 fetch만 담당(동기 setState 없음) — 마운트 effect/버튼 양쪽에서 호출.
  async function fetchIntent() {
    try {
      const res = await fetch("/api/backtranslate/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) setIntentKo(data.intent_ko as string);
      else setIntentError(data?.error?.message ?? "문제 생성에 실패했습니다.");
    } catch {
      setIntentError("네트워크 오류로 문제 생성에 실패했습니다.");
    } finally {
      setIntentLoading(false);
    }
  }

  // "새 문제" 버튼: 상태를 초기화한 뒤 새 과제를 가져온다.
  function newProblem() {
    setIntentLoading(true);
    setIntentError(null);
    setResult(null);
    setLocked(false);
    setScoreError(null);
    setUserEn("");
    void fetchIntent();
  }

  // 첫 진입 시 문제 1개 자동 생성. setState 는 await 이후에만 일어나도록 인라인.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/backtranslate/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setIntentKo(data.intent_ko as string);
        else
          setIntentError(data?.error?.message ?? "문제 생성에 실패했습니다.");
      } catch {
        if (!cancelled) setIntentError("네트워크 오류로 문제 생성에 실패했습니다.");
      } finally {
        if (!cancelled) setIntentLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit() {
    if (!intentKo || !userEn.trim()) return;
    setScoring(true);
    setScoreError(null);
    setLocked(false);
    setResult(null);
    try {
      const res = await fetch("/api/backtranslate/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentKo, userEn }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data as BacktransScore);
      } else if (data?.error?.code === "PLAN_REQUIRED") {
        setLocked(true);
      } else {
        setScoreError(data?.error?.message ?? "채점에 실패했습니다.");
      }
    } catch {
      setScoreError("네트워크 오류로 채점에 실패했습니다.");
    } finally {
      setScoring(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">역번역 트레이닝</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={newProblem}
          disabled={intentLoading}
        >
          {intentLoading ? "생성 중…" : "새 문제"}
        </Button>
      </div>

      {/* 제시된 한국어 의도 */}
      <Card>
        <CardBody className="pt-5">
          <div className="mb-1.5 text-xs font-medium text-faint">
            제시된 한국어 의도 — 뉘앙스까지 살려 영어로
          </div>
          {intentLoading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-soft">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-line2 border-t-ox" />
              문제를 만드는 중…
            </div>
          ) : intentError ? (
            <p className="py-2 text-sm text-gold">{intentError}</p>
          ) : (
            <p className="text-[17px] font-medium leading-relaxed text-ink">
              {intentKo}
            </p>
          )}
        </CardBody>
      </Card>

      {/* 영어 입력 */}
      <Card>
        <CardBody className="space-y-3 pt-5">
          <textarea
            ref={taRef}
            value={userEn}
            onChange={(e) => setUserEn(e.target.value)}
            placeholder="위 의도를 영어로 옮겨 보세요. 제출하면 당신의 영어를 직역해 돌려준 뒤, 소실된 뉘앙스를 짚어 드립니다."
            className="min-h-32 w-full resize-y rounded-btn border border-line2 bg-paper2 p-4 text-[15px] leading-relaxed text-ink outline-none focus:border-ox focus:ring-2 focus:ring-ox/30"
          />
          <div className="flex items-center justify-between">
            {!isPro && (
              <span className="text-xs text-faint">채점은 Pro 전용입니다</span>
            )}
            <Button
              className="ml-auto"
              disabled={!intentKo || !userEn.trim() || scoring}
              onClick={submit}
            >
              {scoring ? "채점 중…" : "제출"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {locked && <PlanLock feature="역번역 채점" />}
      {scoreError && (
        <Card>
          <CardBody className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm text-gold">{scoreError}</span>
            <Button variant="secondary" size="sm" onClick={submit}>
              다시 시도
            </Button>
          </CardBody>
        </Card>
      )}

      {/* 채점 결과 */}
      {result && (
        <Card>
          <CardBody className="space-y-5 pt-5">
            <FidelityGauge value={result.fidelity} />

            <div>
              <div className="mb-1 text-xs font-medium text-faint">
                내 영어를 직역하면 (역번역)
              </div>
              <p className="rounded-btn border border-line2 bg-paper2 p-3 text-[15px] leading-relaxed text-ink">
                {result.back_ko}
              </p>
            </div>

            {result.gaps.length > 0 && (
              <div>
                <div className="mb-1.5 text-xs font-medium text-faint">
                  소실·왜곡된 뉘앙스
                </div>
                <ul className="space-y-2">
                  {result.gaps.map((g, i) => (
                    <li
                      key={i}
                      className="rounded-btn border border-gold/40 bg-gold/5 p-3 text-[13px]"
                    >
                      <div className="font-medium text-ink">
                        의도: {g.intended}
                      </div>
                      <div className="mt-0.5 text-soft">↳ {g.lost}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="mb-1 text-xs font-medium text-faint">
                네이티브 모범
              </div>
              <p className="rounded-btn border border-ox/30 bg-ox/5 p-3 text-[15px] leading-relaxed text-ink">
                {result.model_answer}
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={newProblem}>
                새 문제
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
