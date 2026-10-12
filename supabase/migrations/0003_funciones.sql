-- Funciones con privilegios acotados. Todas fijan search_path y validan quién llama.

-- Copia el catálogo base al taller nuevo. Interna: solo la llaman otras funciones.
create function public.sembrar_catalogo(p_taller uuid) returns void
language sql security definer set search_path = '' as $$
  insert into public.materials (workshop_id, clave, nombre, linea, unidad, precio_centavos, pieza_singular, pieza_plural)
  select p_taller, clave, nombre, linea, unidad, precio_centavos, pieza_singular, pieza_plural
    from public.materiales_base
  on conflict (workshop_id, clave) do nothing
$$;

-- Primer ingreso: liga el taller dado de alta por admin con el mismo teléfono,
-- o crea uno si viene nombre. Sin nombre y sin taller previo regresa null y la UI lo pide.
create function public.reclamar_o_crear_taller(p_nombre text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_tel text := auth.jwt() ->> 'phone';
  v_id uuid;
begin
  if auth.uid() is null or coalesce(v_tel, '') = '' then
    raise exception 'sin sesion' using errcode = '28000';
  end if;
  select id into v_id from public.workshops where owner_id = auth.uid();
  if v_id is not null then return v_id; end if;

  update public.workshops set owner_id = auth.uid()
   where owner_phone = v_tel and owner_id is null
  returning id into v_id;
  if v_id is not null or coalesce(trim(p_nombre), '') = '' then return v_id; end if;

  insert into public.workshops (owner_id, owner_phone, nombre, telefono)
  values (auth.uid(), v_tel, trim(p_nombre), substr(v_tel, 3))
  returning id into v_id;
  perform public.sembrar_catalogo(v_id);
  return v_id;
end $$;

-- Vista pública: solo esta cotización y los datos de contacto del taller.
create function public.cotizacion_publica(p_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'quote', to_jsonb(q) - 'workshop_id' - 'client_id' - 'aviso_pendiente',
    'items', coalesce((
      select jsonb_agg(to_jsonb(i) - 'workshop_id' - 'quote_id' order by i.orden)
        from public.quote_items i where i.quote_id = q.id), '[]'::jsonb),
    'taller', jsonb_build_object('nombre', w.nombre, 'ciudad', w.ciudad, 'telefono', w.telefono,
                                 'condiciones', w.condiciones, 'logo_url', w.logo_url, 'plan', w.plan))
    from public.quotes q
    join public.workshops w on w.id = q.workshop_id
   where q.public_slug = p_slug
$$;

-- El cliente abrió el enlace: queda "vista" si aún no avanzó y el maestro recibe aviso.
-- Si quien abre es el dueño (revisando su propio enlace) no cuenta como apertura.
create function public.registrar_apertura(p_slug text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_quote uuid;
  v_taller uuid;
begin
  if exists (select 1 from public.quotes q join public.workshops w on w.id = q.workshop_id
              where q.public_slug = p_slug and w.owner_id = auth.uid()) then
    return;
  end if;
  update public.quotes
     set viewed_at = now(),
         aviso_pendiente = true,
         status = case when status in ('borrador', 'enviada') then 'vista' else status end
   where public_slug = p_slug
  returning id, workshop_id into v_quote, v_taller;
  if v_quote is null then return; end if;
  insert into public.quote_events (quote_id, workshop_id, tipo) values (v_quote, v_taller, 'abierta');
end $$;

create function public.aceptar_cotizacion(p_slug text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_quote uuid;
  v_taller uuid;
begin
  update public.quotes set status = 'aceptada', aviso_pendiente = true
   where public_slug = p_slug and status <> 'rechazada'
  returning id, workshop_id into v_quote, v_taller;
  if v_quote is null then return; end if;
  insert into public.quote_events (quote_id, workshop_id, tipo) values (v_quote, v_taller, 'aceptada');
end $$;

-- Panel /admin. Cada función revisa es_admin() porque corre con privilegios del dueño.
create function public.exigir_admin() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'solo admin' using errcode = '42501'; end if;
end $$;

create function public.admin_alta_taller(p_nombre text, p_owner_phone text, p_ciudad text, p_condiciones text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform public.exigir_admin();
  insert into public.workshops (owner_phone, nombre, ciudad, condiciones, telefono)
  values (p_owner_phone, trim(p_nombre), trim(p_ciudad), trim(p_condiciones), substr(p_owner_phone, 3))
  returning id into v_id;
  perform public.sembrar_catalogo(v_id);
  return v_id;
end $$;

create function public.admin_activar_plan(p_taller uuid, p_plan text, p_hasta date) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  update public.workshops
     set plan = p_plan, plan_until = p_hasta, is_founder = is_founder or p_plan = 'fundador'
   where id = p_taller;
end $$;

create function public.admin_poner_logo(p_taller uuid, p_url text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_admin();
  update public.workshops set logo_url = p_url where id = p_taller;
end $$;

-- Permisos: por omisión Supabase da execute a anon y authenticated; se cierra y se abre lo justo.
revoke execute on function
  public.sembrar_catalogo(uuid), public.reclamar_o_crear_taller(text), public.cotizacion_publica(text),
  public.registrar_apertura(text), public.aceptar_cotizacion(text), public.exigir_admin(),
  public.admin_alta_taller(text, text, text, text), public.admin_activar_plan(uuid, text, date),
  public.admin_poner_logo(uuid, text)
  from public, anon, authenticated;

grant execute on function public.cotizacion_publica(text), public.registrar_apertura(text),
  public.aceptar_cotizacion(text) to anon, authenticated;
grant execute on function public.reclamar_o_crear_taller(text),
  public.admin_alta_taller(text, text, text, text), public.admin_activar_plan(uuid, text, date),
  public.admin_poner_logo(uuid, text) to authenticated;

-- Logos: lectura pública, escritura solo admin.
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy logos_admin_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and public.es_admin());
create policy logos_admin_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'logos' and public.es_admin());
