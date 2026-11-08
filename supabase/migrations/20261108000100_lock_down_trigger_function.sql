-- handle_new_user only runs as the auth.users trigger; it must not be callable via /rest/v1/rpc.
-- (is_admin() stays executable: RLS policies call it for anon and authenticated visitors,
-- and it only reveals whether the caller is an admin.)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
