import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// 단일 Anthropic 클라이언트 (서버 전용). 키는 ANTHROPIC_API_KEY 에서 자동 로드.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 모델 분리 (02 §5). ID 는 .env 로 관리 — 코드에서 임의 변경 금지.
//   heavy: 5차원 진단·리라이트·3톤·역번역 (품질이 핵심)
//   light: 라이브 힌트(콜로케이션·비교단어) (짧고 잦음, 저지연)
export const MODELS = {
  heavy: process.env.ANTHROPIC_MODEL_HEAVY ?? "claude-opus-4-8",
  light: process.env.ANTHROPIC_MODEL_LIGHT ?? "claude-haiku-4-5",
} as const;
