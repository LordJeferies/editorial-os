-- Editorial OS V9 · Supabase schema
-- Ejecuta este archivo en Supabase > SQL Editor.
-- La app usa una fila JSONB por usuario para mantener la V9 simple y sincronizable.

create table if not exists public.editorial_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_key text not null default 'editorial-os',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, workspace_key)
);

alter table public.editorial_state enable row level security;

revoke all on table public.editorial_state from anon, authenticated;
grant select, insert, update, delete on table public.editorial_state to authenticated;
grant all on table public.editorial_state to service_role;

drop policy if exists "editorial_state_select_own" on public.editorial_state;
create policy "editorial_state_select_own"
on public.editorial_state for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "editorial_state_insert_own" on public.editorial_state;
create policy "editorial_state_insert_own"
on public.editorial_state for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "editorial_state_update_own" on public.editorial_state;
create policy "editorial_state_update_own"
on public.editorial_state for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "editorial_state_delete_own" on public.editorial_state;
create policy "editorial_state_delete_own"
on public.editorial_state for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Realtime: añade la tabla a la publicación si aún no está.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='editorial_state'
  ) then
    alter publication supabase_realtime add table public.editorial_state;
  end if;
end $$;
