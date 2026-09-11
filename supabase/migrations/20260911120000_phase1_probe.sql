-- Phase 1 probe: does a migration pushed through git get applied?
--
-- Observable without anything else deploying: PostgREST exposes a table it can
-- see, so GET /rest/v1/_phase1_probe returns 200 (an empty array, since RLS is
-- on with no policy) if this ran, and 404 with PGRST205 if it did not. The
-- previous round put this question behind an edge function and learned nothing
-- when the function failed to deploy.
create table if not exists public._phase1_probe (
  id int primary key,
  note text not null
);

alter table public._phase1_probe enable row level security;

insert into public._phase1_probe (id, note)
values (1, 'applied by a migration pushed through git')
on conflict (id) do nothing;

-- The function the config.toml hook points at. Registering a hook whose
-- function does not exist would break token issuance, so it is created first
-- and is harmless on its own: unregistered, it simply sits here unused.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
begin
  return jsonb_set(event, '{claims,lovable_hook_probe}', '"reached"'::jsonb);
end;
$$;
