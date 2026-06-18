-- 0004_subscriptions_unique_active.sql — 사용자당 활성 구독 1개 보장
-- 목적: 결제 확인(/api/billing/confirm)의 "기존 active 해지 → 새 insert" 가
--       비원자적이라, 동시 요청(성공 페이지 동시 새로고침 등) 시 active 행이
--       2개 쌓일 수 있음. 부분 유니크 인덱스로 DB 차원에서 차단.
-- 적용: Supabase SQL Editor 에 수동 적용(0001~0003 과 동일 방식).

create unique index if not exists uniq_subs_one_active_per_user
  on public.subscriptions (user_id)
  where status = 'active';
