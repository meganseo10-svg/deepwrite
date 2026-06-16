-- 03. DATA MODEL — DEEPWRITE Supabase 스키마
-- supabase/migrations/0001_init.sql 로 저장 후 실행

-- 1. 사용자 프로필 (auth.users 확장)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan text not null default 'free',          -- free | basic | pro | master | business
  estimated_cefr text,                          -- 예: 'B2.3'
  default_tone text not null default 'neutral', -- formal | neutral | casual
  hint_mode text not null default 'after_try',  -- instant | after_try | off
  created_at timestamptz default now()
);

-- 2. 작문 세션 (글 한 편 = 1 row)
create table writings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
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
create table weakness_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  writing_id uuid references writings(id) on delete cascade,
  category text not null,           -- article | collocation | tense | preposition | run_on | register | word_choice ...
  detail text,                      -- 구체 오류 설명
  example text,                     -- 해당 문장 일부
  created_at timestamptz default now()
);

-- 4. 역번역 세션
create table backtranslations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  intent_ko text not null,          -- 제시된 한국어 의도
  user_en text not null,            -- 사용자가 쓴 영어
  back_ko text,                     -- AI가 역번역한 한국어
  fidelity int,                     -- 의도 일치도 0~100
  gaps jsonb,                       -- 소실된 뉘앙스 목록
  model_answer text,                -- 네이티브 모범
  created_at timestamptz default now()
);

-- 5. 표현장 (deepread 연동 / 모방 훈련 소스)
create table saved_expressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  expression text not null,
  note text,
  from_deepread bool default false,
  created_at timestamptz default now()
);

-- 6. LLM 캐시 (전역, 개인정보 없는 일반 표현만)
create table llm_cache (
  cache_key text primary key,       -- sha256(text+tone+mode)
  payload jsonb not null,
  created_at timestamptz default now()
);

-- ===== RLS =====
alter table profiles            enable row level security;
alter table writings            enable row level security;
alter table weakness_events     enable row level security;
alter table backtranslations    enable row level security;
alter table saved_expressions   enable row level security;

create policy "own profile"  on profiles        for all using (auth.uid() = id);
create policy "own writings" on writings         for all using (auth.uid() = user_id);
create policy "own weakness" on weakness_events  for all using (auth.uid() = user_id);
create policy "own backtr"   on backtranslations for all using (auth.uid() = user_id);
create policy "own express"  on saved_expressions for all using (auth.uid() = user_id);
-- llm_cache: 서버(service role)만 접근, RLS off 유지

-- ===== 인덱스 =====
create index idx_writings_user_date on writings(user_id, created_at desc);
create index idx_weakness_user_cat  on weakness_events(user_id, category);
create index idx_backtr_user_date   on backtranslations(user_id, created_at desc);

-- ===== 약점 집계 뷰 =====
create view weakness_summary as
select user_id, category, count(*) as cnt
from weakness_events
group by user_id, category;
