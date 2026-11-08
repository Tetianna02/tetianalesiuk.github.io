begin;

do $$
declare
    admin_email text := 'CHANGE_ADMIN_EMAIL';
    user_email text := 'CHANGE_USER_EMAIL';
    admin_id uuid;
    regular_id uuid;
begin
    if admin_email not like '%@%' or user_email not like '%@%' then
        raise exception 'Вкажіть дві фактичні електронні адреси у змінних admin_email та user_email.';
    end if;
    select id into admin_id from auth.users where lower(email) = lower(admin_email);
    select id into regular_id from auth.users where lower(email) = lower(user_email);
    if admin_id is null or regular_id is null or admin_id = regular_id then
        raise exception 'Потрібні два різні наявні облікові записи Supabase Authentication.';
    end if;
    insert into public.user_roles (user_id, role)
    values (admin_id, 'admin'), (regular_id, 'user')
    on conflict (user_id) do update set role = excluded.role;
end;
$$;

select u.email, r.role
from public.user_roles r
join auth.users u on u.id = r.user_id
order by u.email;

commit;
