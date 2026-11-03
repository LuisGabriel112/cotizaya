alter table public.quotes add column revision_of_id uuid references public.quotes(id);
alter table public.quotes add column revision_root_id uuid references public.quotes(id);
alter table public.quotes add column issued_snapshot jsonb;
create index quotes_revision_root on public.quotes(revision_root_id);

alter function public.cotizacion_publica(text) rename to contenido_cotizacion_actual;
revoke execute on function public.contenido_cotizacion_actual(text) from public,anon,authenticated;
create function public.cotizacion_publica(p_slug text) returns jsonb
language sql stable security definer set search_path='' as $$
  select case when q.issued_snapshot is null then public.contenido_cotizacion_actual(p_slug)
    else jsonb_set(jsonb_set(q.issued_snapshot,'{quote,status}',to_jsonb(q.status)),
      '{quote,viewed_at}',coalesce(to_jsonb(q.viewed_at),'null'::jsonb)) end
  from public.quotes q join public.workshops w on w.id=q.workshop_id
  where q.public_slug=p_slug and (q.status<>'borrador' or w.owner_id=auth.uid())
$$;
revoke execute on function public.cotizacion_publica(text) from public,anon,authenticated;
grant execute on function public.cotizacion_publica(text) to anon,authenticated;

-- Conserva el contenido disponible al instalar, sin afirmar que sea el PDF original histórico.
update public.quotes set issued_snapshot=public.contenido_cotizacion_actual(public_slug)
  where status<>'borrador';

create or replace function public.proteger_alta_cotizacion() returns trigger
language plpgsql set search_path='' as $$
begin
  new.created_at:=now(); new.status:='borrador'; new.viewed_at:=null; new.aviso_pendiente:=false;
  new.sent_at:=null; new.expires_at:=null; new.issued_snapshot:=null;
  new.revision_of_id:=null; new.revision_root_id:=null;
  return new;
end $$;

create function public.proteger_emision_cotizacion() returns trigger
language plpgsql set search_path='' as $$
begin
  if old.issued_snapshot is not null and new.issued_snapshot is distinct from old.issued_snapshot then
    raise exception 'emision-inmutable' using errcode='42501';
  end if;
  if old.status<>'borrador' and
    (to_jsonb(new)-array['status','viewed_at','aviso_pendiente','issued_snapshot']) is distinct from
    (to_jsonb(old)-array['status','viewed_at','aviso_pendiente','issued_snapshot']) then
    raise exception 'crea-una-revision' using errcode='42501';
  end if;
  return new;
end $$;
create trigger quotes_inmutable before update on public.quotes
  for each row execute function public.proteger_emision_cotizacion();

create or replace function public.bloquear_padre_partida() returns trigger
language plpgsql security definer set search_path='' as $$
declare v_estado text;
begin
  if tg_op='UPDATE' and (new.quote_id<>old.quote_id or new.workshop_id<>old.workshop_id) then
    raise exception 'partida-no-corresponde' using errcode='42501';
  end if;
  select status into v_estado from public.quotes
    where id=case when tg_op='DELETE' then old.quote_id else new.quote_id end for update;
  if v_estado<>'borrador' and not (tg_op='UPDATE' and new.material_id is null
      and (to_jsonb(new)-'material_id')=(to_jsonb(old)-'material_id')) then
    raise exception 'crea-una-revision' using errcode='42501';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;

create or replace function public.emitir_cotizacion(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare v_c public.quotes;
begin
  select * into v_c from public.quotes where id=p_id and workshop_id=public.mi_taller() for update;
  if not found then raise exception 'cotizacion-inexistente' using errcode='42501'; end if;
  if v_c.status<>'borrador' then return; end if;
  if not exists(select 1 from public.quote_items where quote_id=p_id) then
    raise exception 'cotizacion-sin-partidas' using errcode='22023';
  end if;
  update public.quotes set status='enviada',sent_at=now(),expires_at=now()+interval '15 days' where id=p_id;
  update public.quotes set issued_snapshot=public.contenido_cotizacion_actual(public_slug) where id=p_id;
  insert into public.quote_events(quote_id,workshop_id,tipo) values(p_id,v_c.workshop_id,'enviada');
end $$;

create function public.copiar_partidas_revision(p_origen uuid,p_destino uuid) returns void
language sql security definer set search_path='' as $$
  insert into public.quote_items(quote_id,workshop_id,orden,plantilla_clave,descripcion,material_id,
    unidad,precio_centavos,pieza_singular,pieza_plural,ancho_cm,alto_cm,cantidad,mano_obra_centavos)
  select p_destino,workshop_id,orden,plantilla_clave,descripcion,material_id,unidad,precio_centavos,
    pieza_singular,pieza_plural,ancho_cm,alto_cm,cantidad,mano_obra_centavos
  from public.quote_items where quote_id=p_origen order by orden
$$;

create function public.revisar_cotizacion(p_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_c public.quotes; v_nueva uuid;
begin
  select * into v_c from public.quotes where id=p_id and workshop_id=public.mi_taller() for update;
  if not found then raise exception 'cotizacion-inexistente' using errcode='42501'; end if;
  if v_c.status='borrador' then raise exception 'edita-el-borrador' using errcode='22023'; end if;
  if exists(select 1 from public.quote_items where quote_id=p_id and material_id is null) then
    raise exception 'restaura-el-material-del-catalogo' using errcode='22023';
  end if;
  insert into public.quotes(workshop_id,client_id,cliente_nombre,descuento_pct,con_iva,acabado,garantia_salitre)
    values(v_c.workshop_id,v_c.client_id,v_c.cliente_nombre,v_c.descuento_pct,v_c.con_iva,v_c.acabado,v_c.garantia_salitre)
    returning id into v_nueva;
  update public.quotes set revision_of_id=v_c.id,revision_root_id=coalesce(v_c.revision_root_id,v_c.id) where id=v_nueva;
  perform public.copiar_partidas_revision(p_id,v_nueva);
  return v_nueva;
end $$;
revoke execute on function public.proteger_emision_cotizacion(),public.copiar_partidas_revision(uuid,uuid),
  public.revisar_cotizacion(uuid) from public,anon,authenticated;
grant execute on function public.revisar_cotizacion(uuid) to authenticated;
