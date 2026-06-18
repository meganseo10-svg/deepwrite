// 라이브 LLM 스모크 검증: 7개 LLM 엔드포인트를 실제 프롬프트·스키마로 한 번에 호출.
//   - 실제 라우트와 동일한 system/user 프롬프트(lib/llm/prompts.ts)와 Zod 스키마(lib/schemas/llm.ts)를 그대로 사용.
//   - generate.ts/anthropic.ts 는 `server-only` 가드가 있어 직접 import 불가 → generateJSON 로직만 인라인 복제.
//   - 라우트별 model(heavy/light)·thinking·maxTokens 를 그대로 맞춤 (app/api/**/route.ts 기준).
//
// 실행: npx tsx scripts/llm-smoke.mts
//   - .env.local 의 ANTHROPIC_API_KEY / ANTHROPIC_MODEL_HEAVY / ANTHROPIC_MODEL_LIGHT 사용.
//   - 크레딧 충전 후 실행하면 7/7 통과해야 함.
import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { ZodType } from "zod";

import {
  SYSTEM_ANALYZE,
  userAnalyze,
  SYSTEM_TONE,
  userTone,
  SYSTEM_TONE_CONSISTENCY,
  SYSTEM_COLLOCATION,
  userCollocation,
  SYSTEM_COMPARE,
  userCompare,
  SYSTEM_BACKTRANS_NEW,
  userBacktransNew,
  SYSTEM_BACKTRANS_SCORE,
  userBacktransScore,
  SYSTEM_ONBOARDING,
  userOnboarding,
} from "../lib/llm/prompts.ts";
import {
  AnalyzeSchema,
  ToneSchema,
  ConsistencySchema,
  CollocationSchema,
  CompareSchema,
  BacktransNewSchema,
  BacktransScoreSchema,
  OnboardingSchema,
} from "../lib/schemas/llm.ts";

// ── .env.local 로드 ──
const env: Record<string, string> = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const HEAVY = env.ANTHROPIC_MODEL_HEAVY || "claude-opus-4-8";
const LIGHT = env.ANTHROPIC_MODEL_LIGHT || "claude-haiku-4-5";
const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// ── generate.ts 의 generateJSON 인라인 복제 (1회 재시도 포함) ──
async function generateJSON<T>(opts: {
  model: string;
  system: string;
  user: string;
  schema: ZodType<T>;
  maxTokens?: number;
  thinking?: boolean;
}): Promise<T> {
  const call = async (): Promise<T> => {
    const message = await client.messages.parse({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 4096,
      ...(opts.thinking ? { thinking: { type: "adaptive" as const } } : {}),
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
      output_config: { format: zodOutputFormat(opts.schema) },
    });
    if (!message.parsed_output)
      throw new Error("LLM이 파싱 가능한 출력을 반환하지 않았습니다.");
    return message.parsed_output as T;
  };
  try {
    return await call();
  } catch (err) {
    try {
      return await call();
    } catch {
      throw err instanceof Error ? err : new Error("generateJSON 실패");
    }
  }
}

// ── 케이스 입력 (한국인 상급 학습자 스타일, Konglish 포함) ──
const SAMPLE_TEXT =
  "I want to say my opinion about this issue. In nowadays, many people uses smartphone too much, so I think we should make a research about this problem and find solution.";
const SAMPLE_INTENT =
  "이 문제에 대한 제 의견을 정중하게 말하고 싶어요. 요즘 사람들이 스마트폰을 너무 많이 써서 연구가 필요하다는 뜻이에요.";
const MIXED_PARAGRAPH =
  "We are pleased to inform you of the results. Anyway, the thing is, it kinda went sideways. Accordingly, the committee shall reconvene to deliberate further.";
const BT_INTENT =
  "이 정책은 단기적으로는 효과가 있을지 몰라도, 장기적으로는 오히려 역효과를 낳을 수 있다.";
const BT_USER_EN =
  "This policy maybe works in short time, but in long term it can make bad effect to us.";

type Case = {
  name: string;
  model: string;
  run: () => Promise<unknown>;
  schema: ZodType;
};

const cases: Case[] = [
  {
    name: "analyze (§1 5차원+3톤, heavy+thinking)",
    model: HEAVY,
    schema: AnalyzeSchema,
    run: () =>
      generateJSON({
        model: HEAVY,
        system: SYSTEM_ANALYZE,
        user: userAnalyze(SAMPLE_TEXT, "essay", SAMPLE_INTENT),
        schema: AnalyzeSchema,
        thinking: true,
        maxTokens: 8000,
      }),
  },
  {
    name: "tone (§2 3톤 변환, heavy)",
    model: HEAVY,
    schema: ToneSchema,
    run: () =>
      generateJSON({
        model: HEAVY,
        system: SYSTEM_TONE,
        user: userTone("I think we should change the plan because it is not working."),
        schema: ToneSchema,
        maxTokens: 2048,
      }),
  },
  {
    name: "tone/consistency (§2 일관성, heavy)",
    model: HEAVY,
    schema: ConsistencySchema,
    run: () =>
      generateJSON({
        model: HEAVY,
        system: SYSTEM_TONE_CONSISTENCY,
        user: MIXED_PARAGRAPH,
        schema: ConsistencySchema,
        maxTokens: 2048,
      }),
  },
  {
    name: "hint/collocation (§3-a, light)",
    model: LIGHT,
    schema: CollocationSchema,
    run: () =>
      generateJSON({
        model: LIGHT,
        system: SYSTEM_COLLOCATION,
        user: userCollocation("research", "neutral"),
        schema: CollocationSchema,
        maxTokens: 1024,
      }),
  },
  {
    name: "hint/compare (§3-b, light)",
    model: LIGHT,
    schema: CompareSchema,
    run: () =>
      generateJSON({
        model: LIGHT,
        system: SYSTEM_COMPARE,
        user: userCompare("important"),
        schema: CompareSchema,
        maxTokens: 1024,
      }),
  },
  {
    name: "backtranslate/new (§4-a, heavy)",
    model: HEAVY,
    schema: BacktransNewSchema,
    run: () =>
      generateJSON({
        model: HEAVY,
        system: SYSTEM_BACKTRANS_NEW,
        user: userBacktransNew("B2", "email"),
        schema: BacktransNewSchema,
        maxTokens: 512,
      }),
  },
  {
    name: "backtranslate/score (§4-b, heavy+thinking)",
    model: HEAVY,
    schema: BacktransScoreSchema,
    run: () =>
      generateJSON({
        model: HEAVY,
        system: SYSTEM_BACKTRANS_SCORE,
        user: userBacktransScore(BT_INTENT, BT_USER_EN),
        schema: BacktransScoreSchema,
        thinking: true,
        maxTokens: 4096,
      }),
  },
  {
    name: "onboarding (§5, heavy+thinking)",
    model: HEAVY,
    schema: OnboardingSchema,
    run: () =>
      generateJSON({
        model: HEAVY,
        system: SYSTEM_ONBOARDING,
        user: userOnboarding([
          "Dear team, I am writing to inform you about the schedule change for next week meeting.",
          "Technology change our life so much. In the past, people communicate by letter, but now we use messenger app every day.",
          "hey what's up! long time no see lol. wanna grab some coffee this weekend?",
        ]),
        schema: OnboardingSchema,
        thinking: true,
        maxTokens: 4096,
      }),
  },
];

// ── 실행 ──
console.log(`LLM 스모크 검증 — heavy=${HEAVY}  light=${LIGHT}\n`);
let pass = 0;
for (const c of cases) {
  const t0 = Date.now();
  try {
    const out = await c.run();
    const sec = ((Date.now() - t0) / 1000).toFixed(1);
    const r = c.schema.safeParse(out);
    if (r.success) {
      pass++;
      console.log(`✅ PASS  ${c.name}  (${sec}s)`);
    } else {
      console.log(`⚠️  SCHEMA  ${c.name}  (${sec}s) — 호출은 됐으나 스키마 불일치`);
      console.log("        " + JSON.stringify(r.error.issues).slice(0, 400));
    }
    const preview = JSON.stringify(out);
    console.log("        out: " + preview.slice(0, 280) + (preview.length > 280 ? " …" : ""));
  } catch (e: unknown) {
    const sec = ((Date.now() - t0) / 1000).toFixed(1);
    const err = e as { status?: number; message?: string };
    console.log(`❌ FAIL  ${c.name}  (${sec}s)  status=${err.status ?? "-"}`);
    console.log("        " + (err.message ?? String(e)).slice(0, 300));
  }
  console.log("");
}
console.log(`${pass}/${cases.length} endpoints passed`);
process.exit(pass === cases.length ? 0 : 1);
