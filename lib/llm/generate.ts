import "server-only";
import type { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "./anthropic";

/**
 * 구조화 출력(structured outputs)으로 JSON 을 받아 Zod 로 검증해 반환.
 * 04 비용·안정 규칙: 실패 시 1회 재시도.
 */
export async function generateJSON<T>(opts: {
  model: string;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
  thinking?: boolean; // 고품질(heavy) 호출에 adaptive thinking 사용
}): Promise<T> {
  const call = async (): Promise<T> => {
    const message = await anthropic.messages.parse({
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
      return await call(); // 1회 재시도
    } catch {
      throw err instanceof Error ? err : new Error("generateJSON 실패");
    }
  }
}
