-- 0001_init.sql — DEEPWRITE 초기 스키마
-- 원본: specs/03_DATA_MODEL.sql
-- Supabase 안전성 보강 3가지(주석 [보강] 표시):
--   1) llm_cache: RLS off 대신 RLS on + 정책 없음 → anon/authenticated 차단, service_role만 접근
--   2) weakness_summary 뷰: security_invoker=on → 조회자 권한으로 RLS 적용(타인 집계 누출 방지)
--   3) profiles 자동 생성 트리거: auth.users 가입 시 profiles 행 생성(이후 writings FK 충족)

-- =====================================================================
-- 1. 사용자 프로필 (auth.users 확장)
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan text not null default 'free',            -- free | basic | pro | master | business
  estimated_cefr text,                          -- 예: 'B2.3'
  default_tone text not null default 'neutral', -- formal | neutral | casual
  hint_mode text not null default 'after_try',  -- instant | after_try | off
  created_at timestamptz default now()
);

-- 2. 작문 세션 (글 한 편 = 1 row)
create table public.writings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  genre text,                       -- email | report | essay | academic | summary | free
  target_tone text not null,        -- formal | neutral | casual
  source_text text not null,        -- 사용자가 쓴 원문
  rewrite_text text,                -- 네이티브 리라이트
  scores jsonb,                     -- {lexis, collocation, structure, cohesion, tone} 각 0~100
  diff jsonb,                       -- 단어 단위 diff 배열
  explanations jsonb,               -- 변경별 {before, after, reason, rule, frequency}
  created_at timestamptz default now()
);

-- 3. 약점 이벤트 (오류 1건 = 1 row, 누적 분석용)
create table public.weakness_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  writing_id uuid references public.writings(id) on delete cascade,
  category text not null,           -- article | collocation | tense | preposition | run_on | register | word_choice ...
  detail text,                      -- 구체 오류 설명
  example text,                     -- 해당 문장 일부
  created_at timestamptz default now()
);

-- 4. 역번역 세션
create table public.backtranslations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  intent_ko text not null,          -- 제시된 한국어 의도
  user_en text not null,            -- 사용자가 쓴 영어
  back_ko text,                     -- AI가 역번역한 한국어
  fidelity int,                     -- 의도 일치도 0~100
  gaps jsonb,                       -- 소실된 뉘앙스 목록
  model_answer text,                -- 네이티브 모범
  created_at timestamptz default now()
);

-- 5. 표현장 (deepread 연동 / 모방 훈련 소스)
create table public.saved_expressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expression text not null,
  note text,
  from_deepread bool default false,
  created_at timestamptz default now()
);

-- 6. LLM 캐시 (전역, 개인정보 없는 일반 표현만)
create table public.llm_cache (
  cache_key text primary key,       -- sha256(text+tone+mode)
  payload jsonb not null,
  created_at timestamptz default now()
);

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.writings            enable row level security;
alter table public.weakness_events     enable row level security;
alter table public.backtranslations    enable row level security;
alter table public.saved_expressions   enable row level security;
-- [보강 1] llm_cache: 원본은 "RLS off 유지"였으나, Supabase에서 RLS off 는
-- anon/authenticated 에게 REST 노출됨. RLS on + 정책 없음으로 두면
-- 일반 키는 전면 차단되고 service_role 키만 우회 접근(= 서버 전용) 가능.
alter table public.llm_cache            enable row level security;

create policy "own profile"  on public.profiles         for all using (auth.uid() = id);
create policy "own writings" on public.writings         for all using (auth.uid() = user_id);
create policy "own weakness" on public.weakness_events  for all using (auth.uid() = user_id);
create policy "own backtr"   on public.backtranslations for all using (auth.uid() = user_id);
create policy "own express"  on public.saved_expressions for all using (auth.uid() = user_id);
-- llm_cache 는 정책 없음(의도적) → service_role 전용.

-- =====================================================================
-- 인덱스
-- =====================================================================
create index idx_writings_user_date on public.writings(user_id, created_at desc);
create index idx_weakness_user_cat  on public.weakness_events(user_id, category);
create index idx_backtr_user_date   on public.backtranslations(user_id, created_at desc);

-- =====================================================================
-- 약점 집계 뷰
-- [보강 2] security_invoker=on : 뷰를 조회한 사용자 권한으로 실행되어
-- 하위 테이블 RLS 가 적용됨(기본 뷰는 소유자 권한이라 타인 집계가 누출될 수 있음).
-- =====================================================================
create view public.weakness_summary
with (security_invoker = on) as
select user_id, category, count(*) as cnt
from public.weakness_events
group by user_id, category;

-- =====================================================================
-- [보강 3] 가입 시 profiles 행 자동 생성
-- writings 등 FK가 profiles(id)를 참조하므로, auth.users 생성 직후 profile 필요.
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
