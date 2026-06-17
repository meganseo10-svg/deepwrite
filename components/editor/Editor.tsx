"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Segmented } from "@/components/editor/Segmented";
import { ToneSelector } from "@/components/tone/ToneSelector";
import { AnalysisPanel, type AnalysisResult } from "@/components/editor/AnalysisPanel";
import { HintPopover } from "@/components/editor/HintPopover";
import { CompareCard } from "@/components/editor/CompareCard";
import { ThreeToneCompare } from "@/components/tone/ThreeToneCompare";
import { PlanLock } from "@/components/ui/PlanLock";
import { updateWritingPrefs } from "@/app/(app)/write/actions";
import { HINT_MODE_OPTIONS, type HintMode, type Tone } from "@/lib/constants";
import type {
  Collocation,
  Compare,
  Consistency,
  ToneResult,
} from "@/lib/schemas/llm";
import { cn } from "@/lib/utils";

const WORD_ONLY_RE = /^[A-Za-z][A-Za-z'-]{1,}$/; // 선택영역이 단어 하나일 때

const WORD_RE = /([A-Za-z][A-Za-z'-]{2,})$/; // 길이 3+ 영어 단어

export function Editor({
  initialTone,
  initialHintMode,
  canSave,
  isPro,
}: {
  initialTone: Tone;
  initialHintMode: HintMode;
  canSave: boolean;
  isPro: boolean; // 비교 단어 카드 Pro 게이트
}) {
  const [tone, setTone] = useState<Tone>(initialTone);
  const [hintMode, setHintMode] = useState<HintMode>(initialHintMode);
  const [text, setText] = useState("");
  const [mobileTab, setMobileTab] = useState<"write" | "analysis">("write");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 라이브 콜로케이션 힌트
  const [hint, setHint] = useState<Collocation | null>(null);
  const [hintWord, setHintWord] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintReq = useRef(0);

  // 비교 단어 카드 (단어 선택 시)
  const [compareWord, setCompareWord] = useState<string | null>(null);
  const [compare, setCompare] = useState<Compare | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareLocked, setCompareLocked] = useState(false);
  const compareReq = useRef(0);

  // 3톤 동시 변환 (§2)
  const [toneResult, setToneResult] = useState<ToneResult | null>(null);
  const [toneLoading, setToneLoading] = useState(false);
  const [toneLocked, setToneLocked] = useState(false); // free/basic 미리보기 소진
  const [toneError, setToneError] = useState<string | null>(null);
  const [consistency, setConsistency] = useState<Consistency | null>(null);
  const [consistencyLoading, setConsistencyLoading] = useState(false);
  const toneReq = useRef(0);
  const consistencyReq = useRef(0);

  const taRef = useRef<HTMLTextAreaElement>(null);

  function closeCompare() {
    setCompareWord(null);
    setCompare(null);
    setCompareLocked(false);
  }

  async function fetchCompare(word: string) {
    const id = ++compareReq.current;
    setCompareLoading(true);
    try {
      const res = await fetch("/api/hint/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      if (id !== compareReq.current) return;
      if (res.ok) setCompare((await res.json()) as Compare);
    } catch {
      /* 조용히 무시 */
    } finally {
      if (id === compareReq.current) setCompareLoading(false);
    }
  }

  // 텍스트에서 단어 하나를 선택하면 비교 카드(또는 Pro 자물쇠).
  function onSelectWord() {
    const el = taRef.current;
    if (!el) return;
    const sel = el.value.slice(el.selectionStart, el.selectionEnd).trim();
    if (!WORD_ONLY_RE.test(sel)) return;
    const word = sel.toLowerCase();
    if (word === compareWord) return;
    setCompareWord(word);
    setCompare(null);
    if (!isPro) {
      setCompareLocked(true);
      return;
    }
    setCompareLocked(false);
    fetchCompare(word);
  }

  function clearHint() {
    setHint(null);
    setHintWord(null);
  }

  async function fetchHint(headword: string) {
    if (headword === hintWord) return; // 이미 표시 중
    const id = ++hintReq.current;
    setHintLoading(true);
    try {
      const res = await fetch("/api/hint/collocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headword, tone }),
      });
      if (id !== hintReq.current) return; // 오래된 응답 무시
      if (res.ok) {
        setHint((await res.json()) as Collocation);
        setHintWord(headword);
      }
    } catch {
      /* 힌트는 실패해도 조용히 무시 */
    } finally {
      if (id === hintReq.current) setHintLoading(false);
    }
  }

  // 힌트모드에 따라 트리거: instant=타이핑 중(디바운스), after_try=단어 완성(구분자) 시
  function maybeHint(value: string, caret: number) {
    if (hintMode === "off") {
      clearHint();
      return;
    }
    if (hintMode === "instant") {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      const m = value.slice(0, caret).match(WORD_RE);
      const hw = m?.[1]?.toLowerCase();
      if (!hw) return;
      hintTimer.current = setTimeout(() => fetchHint(hw), 500);
      return;
    }
    // after_try: 직전 문자가 구분자이면, 그 앞 단어로 힌트
    const last = value[caret - 1];
    if (last && /[\s.,;:!?]/.test(last)) {
      const m = value.slice(0, caret - 1).match(WORD_RE);
      const hw = m?.[1]?.toLowerCase();
      if (hw) fetchHint(hw);
    }
  }

  function persist(next: { tone?: Tone; hintMode?: HintMode }) {
    if (!canSave) return;
    setSaved(false);
    startTransition(async () => {
      const res = await updateWritingPrefs(
        next.tone ?? tone,
        next.hintMode ?? hintMode,
      );
      if ("ok" in res) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  function autosize() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 240)}px`;
  }

  async function analyze() {
    setError(null);
    setAnalyzing(true);
    setMobileTab("analysis");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "진단에 실패했습니다.");
        return;
      }
      setAnalysis(data as AnalysisResult);
    } catch {
      setError("네트워크 오류로 진단에 실패했습니다.");
    } finally {
      setAnalyzing(false);
    }
  }

  function closeTone() {
    setToneResult(null);
    setToneLocked(false);
    setToneError(null);
    setConsistency(null);
  }

  async function compareTones() {
    // 3톤은 문장·짧은 단락용(서버 스키마 2000자) — 긴 글은 친절한 안내로 조기 차단
    if (text.trim().length > 2000) {
      setToneResult(null);
      setToneLocked(false);
      setConsistency(null);
      setToneError(
        "3톤 비교는 2000자 이하의 문장·단락에 적합합니다. 더 짧게 선택해 주세요.",
      );
      return;
    }
    const id = ++toneReq.current;
    consistencyReq.current++; // 진행 중이던 일관성 응답 무효화
    setToneError(null);
    setToneLocked(false);
    setConsistency(null);
    setToneResult(null);
    setToneLoading(true);
    try {
      const res = await fetch("/api/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (id !== toneReq.current) return;
      const data = await res.json();
      if (res.ok) {
        setToneResult(data as ToneResult);
      } else if (data?.error?.code === "PLAN_REQUIRED") {
        setToneLocked(true);
      } else {
        setToneError(data?.error?.message ?? "3톤 변환에 실패했습니다.");
      }
    } catch {
      if (id === toneReq.current) setToneError("네트워크 오류로 실패했습니다.");
    } finally {
      if (id === toneReq.current) setToneLoading(false);
    }
  }

  async function checkConsistency() {
    const id = ++consistencyReq.current;
    setConsistencyLoading(true);
    try {
      const res = await fetch("/api/tone/consistency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (id !== consistencyReq.current) return; // 오래된 응답 무시
      const data = await res.json();
      if (res.ok) setConsistency(data as Consistency);
    } catch {
      /* 일관성 검사 실패는 조용히 무시 */
    } finally {
      if (id === consistencyReq.current) setConsistencyLoading(false);
    }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const leftPane = (
    <Card>
      <CardBody className="space-y-4 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <ToneSelector
            value={tone}
            onChange={(t) => {
              setTone(t);
              persist({ tone: t });
            }}
          />
          {canSave && (
            <span className="text-xs text-faint">
              {pending ? "저장 중…" : saved ? "저장됨 ✓" : ""}
            </span>
          )}
        </div>

        <Segmented
          label="힌트 모드"
          size="sm"
          options={HINT_MODE_OPTIONS}
          value={hintMode}
          onChange={(m) => {
            setHintMode(m);
            persist({ hintMode: m });
          }}
        />

        <div>
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => {
              const v = e.target.value;
              setText(v);
              autosize();
              maybeHint(v, e.target.selectionStart ?? v.length);
            }}
            onMouseUp={onSelectWord}
            onDoubleClick={onSelectWord}
            placeholder="여기에 영어 글을 작성하세요. 통역사처럼 5차원으로 분석해 드립니다. (단어를 더블클릭하면 비교 카드)"
            className="min-h-60 w-full resize-none rounded-btn border border-line2 bg-paper2 p-4 text-[15px] leading-relaxed text-ink outline-none focus:border-ox focus:ring-2 focus:ring-ox/30"
          />
          <div className="mt-1 text-right text-xs text-faint">
            {wordCount} words
          </div>
        </div>

        {hintMode !== "off" && hint && (
          <HintPopover data={hint} loading={hintLoading} onClose={clearHint} />
        )}

        {compareWord &&
          (compareLocked ? (
            <PlanLock feature="비교 단어 카드" onClose={closeCompare} />
          ) : compare ? (
            <CompareCard
              data={compare}
              loading={compareLoading}
              onClose={closeCompare}
            />
          ) : compareLoading ? (
            <div className="rounded-btn border border-line2 bg-card p-3 text-sm text-soft">
              “{compareWord}” 비교 중…
            </div>
          ) : null)}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            disabled={!text.trim() || toneLoading}
            onClick={compareTones}
          >
            {toneLoading ? "변환 중…" : "3톤으로 비교"}
          </Button>
          <Button disabled={!text.trim() || analyzing} onClick={analyze}>
            {analyzing ? "진단 중…" : "진단받기"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  const rightPane = (
    <Card>
      <CardBody className="pt-5">
        {analyzing ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-sm text-soft">
            <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-line2 border-t-ox" />
            5차원으로 분석 중…
          </div>
        ) : error ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-4 text-center">
            <p className="text-sm text-gold">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={analyze}
              disabled={!text.trim()}
            >
              다시 시도
            </Button>
          </div>
        ) : analysis ? (
          <AnalysisPanel result={analysis} />
        ) : (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-btn border border-dashed border-line2 bg-paper2 px-4 py-10 text-center">
            <div className="text-sm font-medium text-soft">분석 결과</div>
            <p className="mt-2 max-w-xs text-sm text-faint">
              글을 입력하고 <span className="text-ink">진단받기</span>를 누르면
              5차원 점수·리라이트·“왜” 설명이 여기에 표시됩니다.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">작문</h1>

      <div className="flex gap-1 rounded-btn bg-paper2 p-1 md:hidden">
        {(["write", "analysis"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMobileTab(t)}
            className={cn(
              "flex-1 rounded-badge px-3 py-1.5 text-sm font-medium transition-colors",
              mobileTab === t ? "bg-card text-ink shadow-sm" : "text-soft",
            )}
          >
            {t === "write" ? "입력" : "분석"}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <div className={cn(mobileTab === "write" ? "block" : "hidden", "md:block")}>
          {leftPane}
        </div>
        <div
          className={cn(mobileTab === "analysis" ? "block" : "hidden", "md:block")}
        >
          {rightPane}
        </div>
      </div>

      {/* 3톤 비교 — 전체 너비 확장 패널 (06 화면2) */}
      {toneError && (
        <Card>
          <CardBody className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm text-gold">{toneError}</span>
            <Button variant="secondary" size="sm" onClick={compareTones}>
              다시 시도
            </Button>
          </CardBody>
        </Card>
      )}
      {toneLocked && (
        <PlanLock feature="3톤 비교" onClose={closeTone} />
      )}
      {toneResult && (
        <ThreeToneCompare
          data={toneResult}
          onClose={closeTone}
          isPro={isPro}
          consistency={consistency}
          consistencyLoading={consistencyLoading}
          onCheckConsistency={checkConsistency}
        />
      )}
    </div>
  );
}
