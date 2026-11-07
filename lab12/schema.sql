begin;

create table if not exists public.phones (
    id bigint generated always as identity primary key,
    model text not null check (char_length(btrim(model)) between 1 and 150),
    brand text not null check (char_length(btrim(brand)) between 1 and 80),
    memory_gb integer not null check (memory_gb in (32, 64, 128, 256, 512, 1024)),
    price numeric(10, 2) not null check (price > 0 and price <= 9999999.99),
    created_at timestamptz not null default now(),
    constraint phones_model_brand_memory_key unique (model, brand, memory_gb)
);

alter table public.phones enable row level security;

revoke all privileges on table public.phones from public, anon, authenticated;
revoke all privileges on sequence public.phones_id_seq from public, anon, authenticated;

grant usage on schema public to anon;
grant select on table public.phones to anon;
grant insert (model, brand, memory_gb, price) on table public.phones to anon;
grant usage on sequence public.phones_id_seq to anon;

drop policy if exists phones_public_read on public.phones;
create policy phones_public_read
on public.phones
for select
to anon
using (true);

drop policy if exists phones_public_insert on public.phones;
create policy phones_public_insert
on public.phones
for insert
to anon
with check (true);

insert into public.phones (model, brand, memory_gb, price)
values
    ('iPhone 15', 'Apple', 128, 31999),
    ('Galaxy S24', 'Samsung', 256, 36999),
    ('Xiaomi 14', 'Xiaomi', 256, 29999),
    ('Pixel 8', 'Google', 128, 24999),
    ('G42', 'Nokia', 128, 7999),
    ('iPhone 15', 'Apple', 256, 35999)
on conflict (model, brand, memory_gb) do nothing;

commit;
