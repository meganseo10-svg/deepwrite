-- 0003_subscriptions.sql — 토스페이먼츠 빌링(자동결제) 구독 기록
-- 목적: 빌링키 발급+첫 결제 성공 시 사용자별 구독을 기록. profiles.plan 은 별도 갱신.
--       (MVP: 매달 자동 재결제 cron 은 추후 — 빌링키만 저장해두고 1회 결제+권한 부여.)
-- 적용: DB 비번 미공유 → Supabase SQL Editor 에 수동 적용(0001·0002 와 동일 방식).

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null,                       -- basic | pro | master
  status text not null default 'active',    -- active | canceled
  billing_key text not null,                -- 토스 빌링키 (재결제용, 민감)
  customer_key text not null,               -- 토스 customerKey (= 사용자 식별자)
  amount integer not null,                  -- 결제 금액(원)
  started_at timestamptz default now(),
  current_period_end timestamptz,           -- 이번 주기 종료(첫 결제 + 1개월)
  last_payment_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz default now()
);

-- RLS: 본인 구독만 조회 가능. 쓰기 정책은 두지 않음 →
--      일반(authenticated) 클라이언트의 insert/update/delete 차단, 서버 service_role 만 기록.
alter table public.subscriptions enable row level security;
create policy "own subscription read" on public.subscriptions
  for select using (auth.uid() = user_id);

-- 활성 구독 조회용 인덱스
create index idx_subs_user_status
  on public.subscriptions(user_id, status, created_at desc);
