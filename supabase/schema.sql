create extension if not exists pgcrypto;
create table if not exists public.bookings (
 id uuid primary key default gen_random_uuid(), request_id text unique not null,
 full_name text not null, email text not null, phone text not null,
 website_type text not null, company_name text, project_description text not null,
 required_features text, reference_website text, budget text not null, timeline text not null,
 preferred_contact text not null, additional_message text, status text not null default 'NEW',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
alter table public.admin_users enable row level security;
create policy "admins read own membership" on public.admin_users for select to authenticated using (user_id = auth.uid());
alter table public.bookings enable row level security;
create policy "admins read bookings" on public.bookings for select to authenticated using exists (select 1 from public.admin_users a where a.user_id = auth.uid());
create policy "admins update bookings" on public.bookings for update to authenticated using exists (select 1 from public.admin_users a where a.user_id = auth.uid()) with check exists (select 1 from public.admin_users a where a.user_id = auth.uid());
create policy "admins delete bookings" on public.bookings for delete to authenticated using exists (select 1 from public.admin_users a where a.user_id = auth.uid());
-- Public insertion is intentionally NOT granted. The Edge Function uses the service role server-side.

-- After creating your Supabase Auth user, add that user's UUID to admin_users:
-- insert into public.admin_users(user_id) values ('YOUR_AUTH_USER_UUID');
