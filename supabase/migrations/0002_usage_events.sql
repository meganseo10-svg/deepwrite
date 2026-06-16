-- 0002_usage_events.sql — 계량형(metered) 액션 사용량 추적
-- 목적: writings 로 카운트되지 않는 무료 게이트 액션(예: 3톤 미리보기)의
--       사용자별·일자별 횟수를 세기 위함. (05: /api/tone — free/basic 미리보기 1회/일)
-- 적용: DB 비번 미공유 → Supabase SQL Editor 에 수동 적용(0001 과 동일 방식).

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null,            -- 'tone_preview' | (이후 다른 계량 액션 추가 가능)
  created_at timestamptz default now()
);

-- RLS: 본인 행만(0001 의 다른 사용자 테이블과 동일 패턴)
alter table public.usage_events enable row level security;
create policy "own usage" on public.usage_events
  for all using (auth.uid() = user_id);

-- 일자별 게이트 카운트용 인덱스
create index idx_usage_user_feat_date
  on public.usage_events(user_id, feature, created_at desc);
