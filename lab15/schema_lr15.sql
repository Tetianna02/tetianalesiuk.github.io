begin;

create table if not exists public.user_roles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'user' check (role in ('user', 'admin'))
);

alter table public.user_roles enable row level security;
revoke all on table public.user_roles from public, anon, authenticated;
revoke all (user_id, role) on public.user_roles from public, anon, authenticated;

insert into public.user_roles (user_id, role)
select id, 'user' from auth.users
on conflict (user_id) do nothing;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.user_roles
        where user_id = (select auth.uid()) and role = 'admin'
    );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function public.check_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select private.is_admin();
$$;

revoke all on function public.check_admin() from public, anon, authenticated;
grant execute on function public.check_admin() to authenticated;

alter table public.phones enable row level security;

do $$
declare
    policy_row record;
begin
    for policy_row in
        select policyname from pg_catalog.pg_policies
        where schemaname = 'public' and tablename = 'phones'
    loop
        execute format('drop policy %I on public.phones', policy_row.policyname);
    end loop;
end;
$$;

revoke all on table public.phones from public, anon, authenticated;
revoke all (id, model, brand, memory_gb, price, created_at) on public.phones from public, anon, authenticated;
revoke all on sequence public.phones_id_seq from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.phones to anon, authenticated;
grant insert (model, brand, memory_gb, price) on public.phones to authenticated;
grant update (model, brand, memory_gb, price) on public.phones to authenticated;
grant delete on table public.phones to authenticated;
grant usage on sequence public.phones_id_seq to authenticated;

create policy phones_public_read on public.phones
for select to anon, authenticated using (true);

create policy phones_admin_insert on public.phones
for insert to authenticated
with check ((select private.is_admin()));

create policy phones_admin_update on public.phones
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy phones_admin_delete on public.phones
for delete to authenticated
using ((select private.is_admin()));

commit;
