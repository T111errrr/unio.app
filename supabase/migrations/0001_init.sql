-- Unio v1 — skema awal
-- Semua nominal uang disimpan sebagai bigint dalam rupiah (tanpa desimal).
-- Semua tabel data memakai soft delete (deleted_at) untuk "Recently Deleted" 30 hari.
-- Keamanan: Row Level Security aktif di semua tabel; pengguna hanya melihat barisnya sendiri.
-- Foreign key gabungan (id, user_id) mencegah baris menunjuk data milik pengguna lain.

-- ---------------------------------------------------------------------------
-- Util
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1 baris per akun)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text,
  locale            text not null default 'id' check (locale in ('id', 'en')),
  theme             text not null default 'system' check (theme in ('system', 'light', 'dark')),
  timezone          text not null default 'Asia/Jakarta',
  daily_review_time time not null default '21:00',
  reduce_motion     boolean not null default false,
  text_size         text not null default 'standard' check (text_size in ('small', 'standard', 'large')),
  onboarding_done   boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Buat profil otomatis saat akun baru dibuat
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Keuangan
-- ---------------------------------------------------------------------------
create table public.wallets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name            text not null check (length(trim(name)) > 0),
  kind            text not null check (kind in ('bank', 'ewallet', 'cash', 'savings', 'paylater')),
  opening_balance bigint not null default 0,
  credit_limit    bigint check (credit_limit is null or credit_limit >= 0),   -- hanya paylater
  due_day         smallint check (due_day is null or due_day between 1 and 31), -- hanya paylater
  icon            text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (id, user_id)
);

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  emoji      text,
  kind       text not null check (kind in ('expense', 'income')),
  keywords   text[] not null default '{}',  -- kata kunci auto-kategori dari Siri
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, user_id)
);

create table public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id  uuid,                         -- null = budget total bulanan
  month        date not null check (month = date_trunc('month', month)::date),
  limit_amount bigint not null check (limit_amount > 0),
  warn_at      smallint not null default 80 check (warn_at between 1 and 100),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  foreign key (category_id, user_id) references public.categories (id, user_id)
);

create unique index budgets_one_per_month
  on public.budgets (user_id, coalesce(category_id, '00000000-0000-0000-0000-000000000000'::uuid), month)
  where deleted_at is null;

create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  wallet_id   uuid not null,
  category_id uuid,
  kind        text not null check (kind in ('expense', 'income')),
  amount      bigint not null check (amount > 0),
  occurred_at timestamptz not null default now(),
  note        text,
  source      text not null default 'app' check (source in ('app', 'siri', 'shortcut')),
  request_id  text,                          -- anti entri ganda dari Shortcuts
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  foreign key (wallet_id, user_id) references public.wallets (id, user_id),
  foreign key (category_id, user_id) references public.categories (id, user_id)
);

create table public.transfers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  from_wallet_id uuid not null,
  to_wallet_id   uuid not null,
  amount         bigint not null check (amount > 0),
  occurred_at    timestamptz not null default now(),
  note           text,
  request_id     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  check (from_wallet_id <> to_wallet_id),
  foreign key (from_wallet_id, user_id) references public.wallets (id, user_id),
  foreign key (to_wallet_id, user_id) references public.wallets (id, user_id)
);

-- ---------------------------------------------------------------------------
-- Tugas
-- ---------------------------------------------------------------------------
create table public.task_lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  emoji      text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, user_id)
);

create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  list_id      uuid,
  title        text not null check (length(trim(title)) > 0),
  notes        text,
  due_at       timestamptz,
  is_priority  boolean not null default false,
  status       text not null default 'todo' check (status in ('todo', 'pending', 'done')),
  completed_at timestamptz,
  sort_order   integer not null default 0,
  source       text not null default 'app' check (source in ('app', 'siri', 'shortcut')),
  request_id   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  unique (id, user_id),
  foreign key (list_id, user_id) references public.task_lists (id, user_id)
);

create table public.subtasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  task_id    uuid not null,
  title      text not null check (length(trim(title)) > 0),
  is_done    boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Catatan
-- ---------------------------------------------------------------------------
create table public.folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, user_id)
);

create table public.notes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  folder_id    uuid,
  title        text not null default '',
  content      jsonb not null default '{}'::jsonb,  -- dokumen teks kaya (tanpa gambar)
  content_text text not null default '',            -- salinan teks polos untuk pencarian
  is_pinned    boolean not null default false,
  source       text not null default 'app' check (source in ('app', 'siri', 'shortcut')),
  request_id   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  unique (id, user_id),
  foreign key (folder_id, user_id) references public.folders (id, user_id)
);

create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index tags_unique_name on public.tags (user_id, lower(name));

create table public.note_tags (
  note_id uuid not null,
  tag_id  uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (note_id, tag_id),
  foreign key (note_id, user_id) references public.notes (id, user_id) on delete cascade,
  foreign key (tag_id, user_id) references public.tags (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Inbox, API key Shortcuts, Web Push
-- ---------------------------------------------------------------------------
create table public.inbox_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  raw_text      text not null,
  reason        text,                         -- kenapa gagal diurai (mis. "nominal tidak ditemukan")
  source        text not null default 'siri' check (source in ('app', 'siri', 'shortcut')),
  status        text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_kind text check (resolved_kind in ('transaction', 'task', 'note')),
  resolved_id   uuid,
  request_id    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table public.api_keys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key_hash     text not null unique,          -- SHA-256 dari key; key asli tidak pernah disimpan
  key_prefix   text not null,                 -- mis. "unio_sk_"
  last4        text not null,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

create table public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Trigger updated_at
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['wallets','categories','budgets','transactions','transfers',
                           'task_lists','tasks','subtasks','folders','notes','inbox_items']
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Index
-- ---------------------------------------------------------------------------
create index transactions_user_time on public.transactions (user_id, occurred_at desc) where deleted_at is null;
create index transactions_wallet    on public.transactions (wallet_id) where deleted_at is null;
create index transfers_user_time    on public.transfers (user_id, occurred_at desc) where deleted_at is null;
create index tasks_user_status_due  on public.tasks (user_id, status, due_at) where deleted_at is null;
create index subtasks_task          on public.subtasks (task_id);
create index notes_user_updated     on public.notes (user_id, is_pinned desc, updated_at desc) where deleted_at is null;
create index inbox_user_open        on public.inbox_items (user_id, created_at desc) where status = 'open' and deleted_at is null;

-- request_id unik per pengguna (idempoten untuk Shortcuts)
create unique index transactions_request on public.transactions (user_id, request_id) where request_id is not null;
create unique index transfers_request    on public.transfers    (user_id, request_id) where request_id is not null;
create unique index tasks_request        on public.tasks        (user_id, request_id) where request_id is not null;
create unique index notes_request        on public.notes        (user_id, request_id) where request_id is not null;
create unique index inbox_request        on public.inbox_items  (user_id, request_id) where request_id is not null;

-- ---------------------------------------------------------------------------
-- View saldo kantong (saldo awal + pemasukan − pengeluaran + transfer masuk − transfer keluar)
-- security_invoker: view mengikuti RLS pengguna yang memanggil.
-- ---------------------------------------------------------------------------
create view public.wallet_balances
with (security_invoker = true)
as
select
  w.id as wallet_id,
  w.user_id,
  w.opening_balance
    + coalesce((select sum(case when t.kind = 'income' then t.amount else -t.amount end)
                from public.transactions t
                where t.wallet_id = w.id and t.deleted_at is null), 0)
    + coalesce((select sum(tr.amount) from public.transfers tr
                where tr.to_wallet_id = w.id and tr.deleted_at is null), 0)
    - coalesce((select sum(tr.amount) from public.transfers tr
                where tr.from_wallet_id = w.id and tr.deleted_at is null), 0)
    as balance
from public.wallets w
where w.deleted_at is null;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profil sendiri: baca" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profil sendiri: ubah" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['wallets','categories','budgets','transactions','transfers',
                           'task_lists','tasks','subtasks','folders','notes','tags','note_tags',
                           'inbox_items','api_keys','push_subscriptions']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "baris sendiri" on public.%I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))', t);
  end loop;
end;
$$;

-- Catatan operasional (dikerjakan di tugas terpisah, bukan di migrasi ini):
-- * /api/capture memakai service role di server setelah memverifikasi hash API key,
--   jadi user_id harus diisi eksplisit di sana (auth.uid() kosong untuk service role).
-- * Pembersihan baris deleted_at > 30 hari dan ping anti-jeda: pg_cron / Edge Function (tugas 1.13 & 3.07).
