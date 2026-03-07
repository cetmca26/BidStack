-- 0025_admin_auth.sql
-- 1. Create a profiles table to track user roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'viewer')) default 'viewer',
  created_at timestamptz not null default now()
);

-- 2. Create a trigger to automatically create a profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Note: The USER must manually promote their specific user to 'admin' in the profiles table.
-- update public.profiles set role = 'admin' where email = 'your-admin@email.com';
