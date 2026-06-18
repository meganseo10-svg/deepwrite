-- 0006_saved_vocab.sql — 표현장을 '어휘장'으로 확장
-- 목적: 다듬은 문장(expression) 통째 저장 외에, 진단이 뽑아준 어휘 카드
--       (단어·문법·콜로케이션·유의어·반의어·예문)를 하나씩 저장할 수 있게 함.
--       deepread 단어장형.
-- 적용: Supabase SQL Editor 에 수동 적용(0001~0005 와 동일 방식).
-- 안전: nullable 컬럼이라 기존 행/코드 무영향. expression 은 not null 이므로
--       어휘 카드 저장 시 expression=headword 로 채운다.

alter table public.saved_expressions
  add column if not exists headword text,   -- 어휘 카드의 표제어 (null=일반 표현 저장)
  add column if not exists vocab jsonb;      -- {pos, meaning_ko, collocations, synonyms, antonyms, example}
