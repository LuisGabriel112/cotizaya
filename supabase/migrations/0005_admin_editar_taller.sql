-- El admin corrige nombre, ciudad y condiciones de un taller ya dado de alta.
create function public.admin_editar_taller(p_taller uuid, p_nombre text, p_ciudad text, p_condiciones text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  update public.workshops
     set nombre = trim(p_nombre), ciudad = trim(p_ciudad), condiciones = trim(p_condiciones)
   where id = p_taller;
end $$;

revoke execute on function public.admin_editar_taller(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_editar_taller(uuid, text, text, text) to authenticated;
