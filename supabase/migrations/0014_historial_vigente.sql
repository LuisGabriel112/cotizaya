alter table public.quotes add column superseded_at timestamptz;
create unique index quotes_revision_lineal on public.quotes(revision_of_id) where revision_of_id is not null;

create or replace function public.proteger_emision_cotizacion() returns trigger
language plpgsql set search_path='' as $$
begin
  if old.issued_snapshot is not null and new.issued_snapshot is distinct from old.issued_snapshot then
    raise exception 'emision-inmutable' using errcode='42501';
  end if;
  if old.status<>'borrador' and
    (to_jsonb(new)-array['status','viewed_at','aviso_pendiente','issued_snapshot','superseded_at']) is distinct from
    (to_jsonb(old)-array['status','viewed_at','aviso_pendiente','issued_snapshot','superseded_at']) then
    raise exception 'crea-una-revision' using errcode='42501';
  end if;
  return new;
end $$;

create or replace function public.cotizacion_publica(p_slug text) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_set(case when q.issued_snapshot is null then public.contenido_cotizacion_actual(p_slug)
    else jsonb_set(jsonb_set(q.issued_snapshot,'{quote,status}',to_jsonb(q.status)),
      '{quote,viewed_at}',coalesce(to_jsonb(q.viewed_at),'null'::jsonb)) end,
      '{quote,superseded_at}',coalesce(to_jsonb(q.superseded_at),'null'::jsonb))
  from public.quotes q join public.workshops w on w.id=q.workshop_id
  where q.public_slug=p_slug and (q.status<>'borrador' or w.owner_id=auth.uid())
$$;

create function public.sustituir_oferta_anterior() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if old.status='borrador' and new.status='enviada' and new.revision_of_id is not null then
    update public.quotes set superseded_at=now() where id=new.revision_of_id;
  end if;
  return null;
end $$;
create trigger quotes_sustituir after update of status on public.quotes
  for each row execute function public.sustituir_oferta_anterior();

create or replace function public.aceptar_cotizacion(p_slug text) returns void
language plpgsql security definer set search_path='' as $$
declare v_c public.quotes;
begin
  select * into v_c from public.quotes where public_slug=p_slug for update;
  if not found or v_c.status='aceptada' then return; end if;
  if v_c.status not in ('enviada','vista') or v_c.expires_at is null
     or v_c.expires_at<now() or v_c.superseded_at is not null then
    raise exception 'cotizacion-no-vigente' using errcode='22023';
  end if;
  update public.quotes set status='aceptada',aviso_pendiente=true where id=v_c.id;
  insert into public.quote_events(quote_id,workshop_id,tipo) values(v_c.id,v_c.workshop_id,'aceptada');
end $$;

create or replace function public.revisar_cotizacion(p_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_c public.quotes; v_nueva uuid; v_estado text;
begin
  select * into v_c from public.quotes where id=p_id and workshop_id=public.mi_taller() for update;
  if not found then raise exception 'cotizacion-inexistente' using errcode='42501'; end if;
  if v_c.status='borrador' then raise exception 'edita-el-borrador' using errcode='22023'; end if;
  select id,status into v_nueva,v_estado from public.quotes where revision_of_id=p_id;
  if found then
    if v_estado='borrador' then return v_nueva; end if;
    raise exception 'revisa-la-version-mas-reciente' using errcode='22023';
  end if;
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

create function public.historial_cotizacion(p_id uuid)
returns table(id uuid,folio int,status text,created_at timestamptz)
language sql stable security definer set search_path='' as $$
  select q.id,q.folio,q.status,q.created_at from public.quotes q
  join public.quotes origen on origen.id=p_id and origen.workshop_id=public.mi_taller()
  where q.workshop_id=origen.workshop_id
    and coalesce(q.revision_root_id,q.id)=coalesce(origen.revision_root_id,origen.id)
  order by q.folio desc
$$;
revoke execute on function public.sustituir_oferta_anterior(),public.historial_cotizacion(uuid)
  from public,anon,authenticated;
grant execute on function public.historial_cotizacion(uuid) to authenticated;
