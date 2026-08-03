create table if not exists public.wrong_questions (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  record_id text not null,
  title text,
  status text,
  review_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz not null default now(),
  data jsonb not null,
  unique (client_id, record_id)
);

create index if not exists wrong_questions_client_created_idx
  on public.wrong_questions (client_id, created_at desc);

create index if not exists wrong_questions_client_review_idx
  on public.wrong_questions (client_id, review_at);
