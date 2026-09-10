-- Probe: does Lovable Cloud apply an auth hook declared in supabase/config.toml?
--
-- The function is created first and is deliberately harmless: it returns the
-- event unchanged apart from one added claim. If the hook is never registered,
-- this function simply sits unused and nothing breaks. If it IS registered, the
-- claim appears in every access token the project issues.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
begin
  return jsonb_set(
    event,
    '{claims,lovable_hook_probe}',
    to_jsonb('applied'::text)
  );
end;
$$;

grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
