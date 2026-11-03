-- La base es autoritativa incluso cuando se llama PostgREST sin las Server Actions.
create function public.importe_partida(p public.quote_items) returns int
language plpgsql immutable set search_path = '' as $$
declare v_material numeric;
begin
  if p.cantidad not between 1 and 99 or p.mano_obra_centavos not between 0 and 100000000
     or p.ancho_cm not between 0 and 100000 or p.alto_cm not between 0 and 100000
     or length(trim(p.descripcion)) not between 1 and 200 then
    raise exception 'partida-invalida' using errcode = '22023';
  end if;
  if p.unidad <> 'pieza' and (p.ancho_cm = 0 or p.alto_cm = 0) then
    raise exception 'medida-invalida' using errcode = '22023';
  end if;
  v_material := case p.unidad
    when 'm2' then p.ancho_cm::numeric * p.alto_cm * p.precio_centavos * p.cantidad / 10000
    when 'ml' then 2 * (p.ancho_cm::numeric + p.alto_cm) * p.precio_centavos * p.cantidad / 100
    when 'pieza' then p.precio_centavos::numeric * p.cantidad end;
  return (round(v_material) + p.mano_obra_centavos::numeric * p.cantidad)::int;
end $$;

create function public.bloquear_padre_partida() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (new.quote_id <> old.quote_id or new.workshop_id <> old.workshop_id) then
    raise exception 'partida-no-corresponde' using errcode = '42501';
  end if;
  perform 1 from public.quotes where id = case when tg_op = 'DELETE' then old.quote_id else new.quote_id end
    for update;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

create function public.fijar_foto_e_importe() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (new.material_id is not distinct from old.material_id or new.material_id is null) then
    new.unidad := old.unidad; new.precio_centavos := old.precio_centavos;
    new.pieza_singular := old.pieza_singular; new.pieza_plural := old.pieza_plural;
  else
    select unidad, precio_centavos, pieza_singular, pieza_plural
      into new.unidad, new.precio_centavos, new.pieza_singular, new.pieza_plural
      from public.materials where id = new.material_id and workshop_id = new.workshop_id;
    if not found then raise exception 'material-inexistente' using errcode = '42501'; end if;
  end if;
  new.importe_centavos := public.importe_partida(new);
  return new;
end $$;

create function public.fijar_totales_cotizacion() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_subtotal numeric; v_descuento numeric; v_iva numeric;
begin
  select coalesce(sum(importe_centavos), 0) into v_subtotal from public.quote_items where quote_id = new.id;
  v_descuento := round(v_subtotal * new.descuento_pct / 100);
  v_iva := case when new.con_iva then round((v_subtotal - v_descuento) * 16 / 100) else 0 end;
  new.subtotal_centavos := v_subtotal::int; new.descuento_centavos := v_descuento::int;
  new.iva_centavos := v_iva::int; new.total_centavos := (v_subtotal - v_descuento + v_iva)::int;
  return new;
end $$;

create function public.actualizar_totales_padre() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Dispara el cálculo de totales en la misma transacción del INSERT/UPDATE/DELETE.
  update public.quotes set total_centavos = total_centavos
   where id = case when tg_op = 'DELETE' then old.quote_id else new.quote_id end;
  return null;
end $$;

create trigger a_quote_items_bloquear before insert or update or delete on public.quote_items
  for each row execute function public.bloquear_padre_partida();
create trigger b_quote_items_calcular before insert or update on public.quote_items
  for each row execute function public.fijar_foto_e_importe();
create trigger quote_items_totales after insert or update or delete on public.quote_items
  for each row execute function public.actualizar_totales_padre();
create trigger quotes_totales before insert or update on public.quotes
  for each row execute function public.fijar_totales_cotizacion();

revoke execute on function public.importe_partida(public.quote_items), public.bloquear_padre_partida(),
  public.fijar_foto_e_importe(), public.fijar_totales_cotizacion(), public.actualizar_totales_padre()
  from public, anon, authenticated;
