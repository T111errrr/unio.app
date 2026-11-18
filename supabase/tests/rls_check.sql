-- Uji cepat skema + RLS. Jalankan setelah migrasi di database uji (bukan produksi).
-- Lulus bila tidak ada baris "GAGAL" dan diakhiri "SEMUA UJI LULUS".
\set ON_ERROR_STOP on

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.com');

-- 1. Profil dibuat otomatis
do $$ begin
  if (select count(*) from public.profiles) <> 2 then raise exception 'GAGAL: profil otomatis'; end if;
end $$;

-- Pengguna A
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

insert into public.wallets (id, name, kind, opening_balance) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Bank Jago', 'bank', 1000000),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Cash', 'cash', 200000);
insert into public.categories (id, name, emoji, kind, keywords) values
  ('cccccccc-0000-0000-0000-000000000001', 'Kopi', '☕', 'expense', '{kopi,coffee}');
insert into public.transactions (wallet_id, category_id, kind, amount, request_id) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'expense', 25000, 'req-1'),
  ('aaaaaaaa-0000-0000-0000-000000000001', null, 'income', 750000, 'req-2');
insert into public.transfers (from_wallet_id, to_wallet_id, amount) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 100000);

-- 2. Saldo: Jago 1.000.000 + 750.000 − 100.000 = 1.650.000; Cash 200.000 − 25.000 + 100.000 = 275.000
do $$ begin
  if (select balance from public.wallet_balances where wallet_id = 'aaaaaaaa-0000-0000-0000-000000000001') <> 1650000
    then raise exception 'GAGAL: saldo Jago'; end if;
  if (select balance from public.wallet_balances where wallet_id = 'aaaaaaaa-0000-0000-0000-000000000002') <> 275000
    then raise exception 'GAGAL: saldo Cash'; end if;
end $$;

-- 3. request_id yang sama ditolak (anti entri ganda)
do $$ begin
  begin
    insert into public.transactions (wallet_id, kind, amount, request_id)
    values ('aaaaaaaa-0000-0000-0000-000000000002', 'expense', 25000, 'req-1');
    raise exception 'GAGAL: request_id ganda diterima';
  exception when unique_violation then null;
  end;
end $$;

-- Pengguna B
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);

-- 4. B tidak melihat data A
do $$ begin
  if (select count(*) from public.wallets) <> 0 then raise exception 'GAGAL: B melihat kantong A'; end if;
  if (select count(*) from public.transactions) <> 0 then raise exception 'GAGAL: B melihat transaksi A'; end if;
  if (select count(*) from public.wallet_balances) <> 0 then raise exception 'GAGAL: B melihat saldo A'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'GAGAL: B melihat profil lain'; end if;
end $$;

-- 5. B tidak bisa mencatat ke kantong A (foreign key gabungan)
do $$ begin
  begin
    insert into public.transactions (wallet_id, kind, amount)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'expense', 1);
    raise exception 'GAGAL: B mencatat ke kantong A';
  exception when foreign_key_violation then null;
  end;
end $$;

-- 6. B tidak bisa menyisipkan baris atas nama A
do $$ begin
  begin
    insert into public.task_lists (user_id, name) values ('11111111-1111-1111-1111-111111111111', 'Curang');
    raise exception 'GAGAL: B menulis atas nama A';
  exception when insufficient_privilege then null;
  end;
end $$;

-- 7. B tidak bisa mengubah atau menghapus data A
update public.wallets set name = 'Diretas';
delete from public.transactions;
reset role;
do $$ begin
  if exists (select 1 from public.wallets where name = 'Diretas') then raise exception 'GAGAL: B mengubah data A'; end if;
  if (select count(*) from public.transactions) <> 2 then raise exception 'GAGAL: B menghapus data A'; end if;
end $$;

-- 8. Soft delete keluar dari saldo; budget ganda per bulan ditolak
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
update public.transactions set deleted_at = now() where request_id = 'req-1';
insert into public.budgets (month, limit_amount) values ('2026-11-01', 8000000);
do $$ begin
  if (select balance from public.wallet_balances where wallet_id = 'aaaaaaaa-0000-0000-0000-000000000002') <> 300000
    then raise exception 'GAGAL: soft delete masih dihitung'; end if;
  begin
    insert into public.budgets (month, limit_amount) values ('2026-11-01', 1);
    raise exception 'GAGAL: budget ganda diterima';
  exception when unique_violation then null;
  end;
  if (select updated_at = created_at from public.transactions where request_id = 'req-1')
    then raise exception 'GAGAL: updated_at tidak berubah'; end if;
end $$;
reset role;

select 'SEMUA UJI LULUS' as hasil;
