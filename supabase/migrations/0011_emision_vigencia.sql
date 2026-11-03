alter table public.quotes add column sent_at timestamptz;
alter table public.quotes add column expires_at timestamptz;

-- Solo recuperar una fecha histórica con evidencia; no inventar fechas de envío.
update public.quotes q set sent_at=e.enviada, expires_at=e.enviada+interval '15 days'
  from (select quote_id,min(created_at) as enviada from public.quote_events
        where tipo='enviada' group by quote_id) e
 where q.id=e.quote_id and q.status<>'borrador';

create or replace function public.proteger_alta_cotizacion() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.created_at := now(); new.status := 'borrador';
  new.viewed_at := null; new.aviso_pendiente := false;
  new.sent_at := null; new.expires_at := null;
  return new;
end $$;

create function public.emitir_cotizacion(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_c public.quotes;
begin
  select * into v_c from public.quotes where id=p_id and workshop_id=public.mi_taller() for update;
  if not found then raise exception 'cotizacion-inexistente' using errcode='42501'; end if;
  if v_c.status <> 'borrador' then return; end if;
  if not exists(select 1 from public.quote_items where quote_id=p_id) then
    raise exception 'cotizacion-sin-partidas' using errcode='22023';
  end if;
  update public.quotes set status='enviada',sent_at=now(),expires_at=now()+interval '15 days' where id=p_id;
  insert into public.quote_events(quote_id,workshop_id,tipo) values(p_id,v_c.workshop_id,'enviada');
end $$;

create or replace function public.registrar_apertura(p_slug text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_quote uuid; v_taller uuid;
begin
  update public.quotes q set viewed_at=now(),aviso_pendiente=true,status='vista'
   where q.public_slug=p_slug and q.status='enviada' and q.viewed_at is null
     and not exists(select 1 from public.workshops w where w.id=q.workshop_id and w.owner_id=auth.uid())
  returning q.id,q.workshop_id into v_quote,v_taller;
  if v_quote is null then return; end if;
  insert into public.quote_events(quote_id,workshop_id,tipo) values(v_quote,v_taller,'abierta');
end $$;

create or replace function public.aceptar_cotizacion(p_slug text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_c public.quotes;
begin
  select * into v_c from public.quotes where public_slug=p_slug for update;
  if not found or v_c.status='aceptada' then return; end if;
  if v_c.status not in ('enviada','vista') or v_c.expires_at is null or v_c.expires_at<now() then
    raise exception 'cotizacion-no-vigente' using errcode='22023';
  end if;
  update public.quotes set status='aceptada',aviso_pendiente=true where id=v_c.id;
  insert into public.quote_events(quote_id,workshop_id,tipo) values(v_c.id,v_c.workshop_id,'aceptada');
end $$;

revoke update(status) on public.quotes from authenticated;
revoke insert on public.quote_events from authenticated;
revoke execute on function public.emitir_cotizacion(uuid) from public,anon,authenticated;
grant execute on function public.emitir_cotizacion(uuid) to authenticated;
