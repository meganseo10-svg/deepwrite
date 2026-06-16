// T04 검증: 04_LLM_PROMPTS.md 의 예시 JSON 이 Zod 스키마를 통과하는지 (API 호출 없음).
// 실행: npx tsx scripts/schema-check.mts
import {
  AnalyzeSchema,
  ToneSchema,
  ConsistencySchema,
  CollocationSchema,
  CompareSchema,
  BacktransScoreSchema,
  OnboardingSchema,
} from "../lib/schemas/llm.ts";
import type { ZodType } from "zod";

const cases: Array<[string, ZodType, unknown]> = [
  // §1
  [
    "AnalyzeSchema (§1)",
    AnalyzeSchema,
    {
      scores: { lexis: 70, collocation: 60, structure: 75, cohesion: 80, tone: 65 },
      rewrite: "I'd like to share my view on this matter.",
      diff: [
        { op: "replace", before: "say my opinion", after: "share my view" },
        { op: "keep", before: "on this matter" },
      ],
      explanations: [
        {
          before: "say my opinion",
          after: "share my view",
          dimension: "collocation",
          reason: "의견은 'say(말하다)'보다 'share(나누다)'가 영어적 사고",
          rule: "express/share + opinion/view 가 표준 조합",
          frequency: "최빈 (격식·중립 공통)",
        },
      ],
      weaknesses: [{ category: "article", detail: "the 누락", example: "in long term" }],
    },
  ],
  // §2
  [
    "ToneSchema (§2)",
    ToneSchema,
    {
      versions: {
        formal: "It would be advisable to revise the plan, as the current approach has proven ineffective.",
        neutral: "I believe we should revise the plan, since it isn't working well.",
        casual: "Honestly, I think we gotta change the plan — it's just not working.",
      },
      drivers: [
        { aspect: "동사", formal: "would be advisable to revise", neutral: "should revise", casual: "gotta change", note: "완곡·격식의 정도 차이" },
      ],
      consistency_tip: "보고서라면 formal, 동료 메신저면 casual을 권장",
    },
  ],
  // §2 consistency
  [
    "ConsistencySchema",
    ConsistencySchema,
    { main_tone: "formal", outliers: [{ sentence: "...", detected: "casual", fix: "..." }] },
  ],
  // §3-a
  [
    "CollocationSchema (§3-a)",
    CollocationSchema,
    {
      headword: "research",
      collocations: [
        { phrase: "conduct research", register: "formal", freq: 5 },
        { phrase: "do research", register: "casual", freq: 4 },
      ],
      warnings: [{ wrong: "make research", why: "한국어식 오류. make는 무에서 창조할 때" }],
    },
  ],
  // §3-b
  [
    "CompareSchema (§3-b)",
    CompareSchema,
    {
      word: "important",
      near_synonyms: [
        { word: "crucial", register: "formal", intensity: 4, nuance: "없으면 안 되는 결정적", collocation: "a crucial role" },
        { word: "significant", register: "academic", intensity: 3, nuance: "유의미한", collocation: "significant impact" },
      ],
      antonyms: ["trivial", "negligible", "minor"],
    },
  ],
  // §4-b
  [
    "BacktransScoreSchema (§4-b)",
    BacktransScoreSchema,
    {
      back_ko: "이 정책은 단기간에 작동할 수 있지만 장기간에 나쁜 효과를 유발한다.",
      fidelity: 68,
      gaps: [{ intended: "역효과(backfire)", lost: "'bad effect'는 단순 부정, 역효과 뉘앙스 소실" }],
      model_answer: "While this policy may yield short-term gains, it risks proving counterproductive in the long run.",
    },
  ],
  // §5
  [
    "OnboardingSchema (§5)",
    OnboardingSchema,
    { estimated_cefr: "B2.3", top_weakness: ["collocation", "article"] },
  ],
];

let pass = 0;
for (const [name, schema, value] of cases) {
  const r = schema.safeParse(value);
  if (r.success) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    console.log(`  FAIL  ${name}`);
    console.log("        " + JSON.stringify(r.error.issues));
  }
}
console.log(`\n${pass}/${cases.length} schemas passed`);
process.exit(pass === cases.length ? 0 : 1);
