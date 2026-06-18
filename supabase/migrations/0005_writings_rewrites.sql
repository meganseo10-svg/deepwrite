-- 0005_writings_rewrites.sql — 작문 기록에 3톤 리라이트 보존
-- 목적: 진단 시 받은 격식/중립/구어 3톤 리라이트를 writings 에 저장해,
--       작문 기록 상세(/writings/[id])에서 3톤을 모두 다시 볼 수 있게 함.
--       (기존엔 rewrite_text=중립 1종만 저장)
-- 적용: Supabase SQL Editor 에 수동 적용(0001~0004 와 동일 방식).
-- 안전: nullable 컬럼이라 기존 행/코드에 무영향. 적용 전엔 코드가 best-effort 로
--       무시하고, 적용 후 새 진단부터 3톤이 채워진다.

alter table public.writings
  add column if not exists rewrites jsonb;  -- {formal, neutral, casual}
